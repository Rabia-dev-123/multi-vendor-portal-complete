import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma, type Prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can access this endpoint
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can update users
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
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
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (role && !["SUPER_ADMIN", "ADMIN", "VENDOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    if (role) updateData.role = role;

    // Update role-specific fields
    if (role === "VENDOR" || existingUser.role === "VENDOR") {
      if (companyName !== undefined) updateData.companyName = companyName;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (address !== undefined) updateData.address = address;
      if (website !== undefined) updateData.website = website;
      if (taxId !== undefined) updateData.taxId = taxId;
    }

    if (
      role === "ADMIN" ||
      role === "SUPER_ADMIN" ||
      existingUser.role === "ADMIN" ||
      existingUser.role === "SUPER_ADMIN"
    ) {
      if (designation !== undefined) updateData.designation = designation;
      if (featureFlags !== undefined) updateData.featureFlags = featureFlags;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "An error occurred while updating user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can delete users
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      {
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting user" },
      { status: 500 }
    );
  }
}
