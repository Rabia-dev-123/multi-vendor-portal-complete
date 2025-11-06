import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma, type Prisma, type UserRole } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/users - List all users with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only super admin can access this endpoint
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const status = searchParams.get("status"); // 'pending', 'approved', 'all'

    // Build query filters
    const where: Prisma.UserWhereInput = {};

    if (role && role !== "all") {
      where.role = role as UserRole;
    }

    if (status === "pending") {
      where.approvedAt = null;
      where.role = "VENDOR"; // Only vendors need approval
    } else if (status === "approved") {
      where.approvedAt = { not: null };
    }

    const users = await prisma.user.findMany({
      where,
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
        approvedAt: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        designation: true,
        featureFlags: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (any role)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Only super admin can create users
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
      featureFlags,
      autoApprove,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["SUPER_ADMIN", "ADMIN", "VENDOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData: Prisma.UserUncheckedCreateInput = {
      name,
      email,
      passwordHash,
      role,
    };

    // Add role-specific fields
    if (role === "VENDOR") {
      userData.companyName = companyName || null;
      userData.phoneNumber = phoneNumber || null;
      userData.address = address || null;
      userData.website = website || null;
      userData.taxId = taxId || null;
      // Auto-approve if specified, otherwise pending approval
      userData.approvedAt = autoApprove ? new Date() : null;
      userData.approvedById = autoApprove ? parseInt(session.user.id) : null;
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      userData.designation = designation || null;
      userData.featureFlags = featureFlags || null;
      // Admins and super admins don't need approval
      userData.approvedAt = new Date();
      userData.approvedById = parseInt(session.user.id);
    }

    // Create new user
    const user = await prisma.user.create({
      data: userData,
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
      { error: "An error occurred while creating user" },
      { status: 500 }
    );
  }
}