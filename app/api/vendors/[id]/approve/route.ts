import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasFeatureAccess } from "@/lib/utils/checkFeatureAccess";
import { type FeatureFlags } from "@/lib/featureFlags";
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAdminWithAccess =
      session.user.role === "ADMIN" &&
      hasFeatureAccess(
        session.user.featureFlags as FeatureFlags | null,
        "manageVendors"
      );

    if (!isSuperAdmin && !isAdminWithAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Only vendors can be approved" },
        { status: 400 }
      );
    }

    if (user.approvedAt) {
      return NextResponse.json(
        { error: "Vendor is already approved" },
        { status: 400 }
      );
    }

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

    await sendVendorApprovalEmail({
      vendorName: updatedUser.name,
      vendorEmail: updatedUser.email,
      companyName: updatedUser.companyName,
    }).catch(() => {
      console.error("Failed to send vendor approval email");
    });

    return NextResponse.json(
      {
        message: "Vendor approved successfully",
        vendor: updatedUser,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isAdminWithAccess =
      session.user.role === "ADMIN" &&
      hasFeatureAccess(
        session.user.featureFlags as FeatureFlags | null,
        "manageVendors"
      );

    if (!isSuperAdmin && !isAdminWithAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid vendor ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Only vendors can have approval revoked" },
        { status: 400 }
      );
    }

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

    await sendVendorRejectionEmail({
      vendorName: updatedUser.name,
      vendorEmail: updatedUser.email,
      companyName: updatedUser.companyName,
      reason: "Your vendor approval has been revoked by an administrator.",
    }).catch(() => {
      console.error("Failed to send vendor rejection email");
    });

    return NextResponse.json(
      {
        message: "Vendor approval revoked successfully",
        vendor: updatedUser,
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