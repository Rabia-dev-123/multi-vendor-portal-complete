import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - Get all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: any = {};

    if (role && role !== "all") {
      where.role = role;
    }

    if (status && status !== "all") {
      if (status === "pending") {
        where.role = "VENDOR";
        where.approvedAt = null;
      } else if (status === "approved") {
        where.role = "VENDOR";
        where.approvedAt = { not: null };
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        featureFlags: true,
        approvedAt: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        phoneNumber: true,
        address: true,
        website: true,
        taxId: true,
        designation: true,
        companyName: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      name,
      email,
      password,
      role,
      companyName,
      phoneNumber,
      address,
      website,
      taxId,
      designation,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }


    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash(password, 12);

  
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        companyName: companyName || null,
        phoneNumber: phoneNumber || null,
        address: address || null,
        website: website || null,
        taxId: taxId || null,
        designation: designation || null,
        // Auto-approve non-VENDOR users, VENDORS need approval
        approvedAt: role !== "VENDOR" ? new Date() : null,
        approvedById: role !== "VENDOR" ? parseInt(session.user.id) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        phoneNumber: true,
        address: true,
        website: true,
        taxId: true,
        designation: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}