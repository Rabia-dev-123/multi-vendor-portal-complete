import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // DEBUG: Log session info
    console.log("🔐 GET - Session user ID:", session.user.id);
    console.log("🔐 GET - Session user role:", session.user.role);
    console.log("🔐 GET - Requested user ID:", userId);

    // Allow: Super Admin OR any user accessing their own data
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAccessingOwnData = session.user.id === userId.toString();

    if (!isSuperAdmin && !isAccessingOwnData) {
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

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // DEBUG: Log session info
    console.log("🔐 PUT - Session user ID:", session.user.id);
    console.log("🔐 PUT - Session user role:", session.user.role);
    console.log("🔐 PUT - Requested user ID:", userId);

    // Allow: Super Admin OR any user editing their own profile
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isEditingOwnProfile = session.user.id === userId.toString();

    console.log("🔐 PUT - Is Super Admin:", isSuperAdmin);
    console.log("🔐 PUT - Is Editing Own Profile:", isEditingOwnProfile);

    if (!isSuperAdmin && !isEditingOwnProfile) {
      return NextResponse.json({ 
        error: "You can only update your own profile" 
      }, { status: 403 });
    }

    const body = await request.json();
    console.log("📨 PUT - Received data:", body);

    // For normal users (not Super Admin), check for restricted fields
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
      
      const restrictedFieldsInRequest = Object.keys(body).filter(field => 
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // MODE 1: Super Admin - can update any user's details
    if (isSuperAdmin) {
      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.designation !== undefined) updateData.designation = body.designation;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.taxId !== undefined) updateData.taxId = body.taxId;
    } 
    // MODE 2: Normal User (USER, VENDOR, ADMIN) - can update only their own details
    else {
      // ONLY allowed fields for normal users
      if (body.name !== undefined) updateData.name = body.name;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.taxId !== undefined) updateData.taxId = body.taxId;
    }

    console.log("🔄 PUT - Update data:", updateData);

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
      },
    });

    console.log("✅ PUT - User updated successfully");

    return NextResponse.json(
      {
        message: isSuperAdmin ? "User updated successfully" : "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ PUT - Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // DEBUG: Log session info
    console.log("🔐 PATCH - Session user ID:", session.user.id);
    console.log("🔐 PATCH - Session user role:", session.user.role);
    console.log("🔐 PATCH - Requested user ID:", userId);

    // Allow: Super Admin OR any user editing their own profile
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isEditingOwnProfile = session.user.id === userId.toString();

    console.log("🔐 PATCH - Is Super Admin:", isSuperAdmin);
    console.log("🔐 PATCH - Is Editing Own Profile:", isEditingOwnProfile);

    if (!isSuperAdmin && !isEditingOwnProfile) {
      return NextResponse.json({ 
        error: "You can only update your own profile" 
      }, { status: 403 });
    }

    const body = await request.json();
    console.log("📨 PATCH - Received data:", body);

    // For normal users (not Super Admin), check for restricted fields
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
      
      const restrictedFieldsInRequest = Object.keys(body).filter(field => 
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // MODE 1: Super Admin - can update any user's details
    if (isSuperAdmin) {
      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.designation !== undefined) updateData.designation = body.designation;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.taxId !== undefined) updateData.taxId = body.taxId;
    } 
    // MODE 2: Normal User (USER, VENDOR, ADMIN) - can update only their own details
    else {
      // ONLY allowed fields for normal users
      if (body.name !== undefined) updateData.name = body.name;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.taxId !== undefined) updateData.taxId = body.taxId;
    }

    console.log("🔄 PATCH - Update data:", updateData);

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
      },
    });

    console.log("✅ PATCH - User updated successfully");

    return NextResponse.json(
      {
        message: isSuperAdmin ? "User updated successfully" : "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ PATCH - Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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