import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can access all users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Build where clause for filters
    const where: any = {};

    if (role && role !== "all") {
      where.role = role;
    }

    // Status filter for vendors
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
return NextResponse.json(users); // Return array directly, not object
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // TODO: Add your user creation logic here
    // For now, return a placeholder response
    return NextResponse.json({ 
      message: "User creation endpoint - implement logic here",
      user: null 
    }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}