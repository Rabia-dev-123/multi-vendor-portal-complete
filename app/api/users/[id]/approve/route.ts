import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH /api/users/[id]/approve - Approve vendor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can approve vendors
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user exists and is a vendor
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Only vendors can be approved" },
        { status: 400 }
      );
    }

    if (user.approvedAt) {
      return NextResponse.json(
        { error: "User is already approved" },
        { status: 400 }
      );
    }

    // Approve vendor
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        approvedAt: new Date(),
        approvedById: parseInt(session.user.id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        approvedAt: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Vendor approved successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving vendor:", error);
    return NextResponse.json(
      { error: "An error occurred while approving vendor" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id]/reject - Reject/Revoke vendor approval
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can revoke vendor approval
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user exists and is a vendor
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Only vendors can have approval revoked" },
        { status: 400 }
      );
    }

    // Revoke approval
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        approvedAt: null,
        approvedById: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        approvedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Vendor approval revoked successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error revoking vendor approval:", error);
    return NextResponse.json(
      { error: "An error occurred while revoking vendor approval" },
      { status: 500 }
    );
  }
}
