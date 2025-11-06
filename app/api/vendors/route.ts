import { NextRequest, NextResponse } from "next/server";
import { prisma, type Prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasFeatureAccess } from "@/lib/utils/checkFeatureAccess";
import { type FeatureFlags } from "@/lib/featureFlags";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: Prisma.UserWhereInput = {
      role: "VENDOR",
    };

    if (status === "pending") {
      where.approvedAt = null;
    } else if (status === "approved") {
      where.approvedAt = { not: null };
    }

    const vendors = await prisma.user.findMany({
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
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

return NextResponse.json(vendors, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching vendors" },
      { status: 500 }
    );
  }
}
