import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    const isAccessingOwnData = session?.user?.id === userId.toString();

    if (!session?.user || (!isSuperAdmin && !isAccessingOwnData)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    const isEditingOwnProfile = session?.user?.id === userId.toString();

    if (!session?.user || (!isSuperAdmin && !isEditingOwnProfile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const { password, ...updateData } = body;

    if (!isSuperAdmin) {
      const restrictedFields = [
        'role', 
        'featureFlags', 
        'approvedById', 
        'approvedAt', 
        'designation',
        'password',
        'email'
      ];
      
      const restrictedFieldsInRequest = Object.keys(updateData).filter(field => 
        restrictedFields.includes(field)
      );

      if (restrictedFieldsInRequest.length > 0) {
        return NextResponse.json(
          { 
            error: "Cannot update restricted fields",
            restrictedFields: restrictedFieldsInRequest
          },
          { status: 403 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    return NextResponse.json(
      {
        message: isSuperAdmin ? "User updated successfully" : "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
    const isEditingOwnProfile = session?.user?.id === userId.toString();

    if (!session?.user || (!isSuperAdmin && !isEditingOwnProfile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const { password, ...updateData } = body;

    if (!isSuperAdmin) {
      const restrictedFields = [
        'role', 
        'featureFlags', 
        'approvedById', 
        'approvedAt', 
        'designation',
        'password',
        'email'
      ];
      
      const restrictedFieldsInRequest = Object.keys(updateData).filter(field => 
        restrictedFields.includes(field)
      );

      if (restrictedFieldsInRequest.length > 0) {
        return NextResponse.json(
          { 
            error: "Cannot update restricted fields",
            restrictedFields: restrictedFieldsInRequest
          },
          { status: 403 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    return NextResponse.json(
      {
        message: isSuperAdmin ? "User updated successfully" : "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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