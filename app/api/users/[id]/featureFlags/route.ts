import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateFeatureFlagsSchema } from "@/lib/validations/featureFlags";
import { getDefaultFeatureFlags } from "@/lib/featureFlags";

/**
 * GET /api/users/[id]/featureFlags
 * Fetch feature flags for a specific admin user
 */
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

    // Fetch user and check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        featureFlags: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only admins can have feature flags
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Feature flags are only applicable to ADMIN users" },
        { status: 400 }
      );
    }

    // Return feature flags or default flags if none set
    const featureFlags = user.featureFlags || getDefaultFeatureFlags();

    return NextResponse.json(
      {
        userId: user.id,
        userName: user.name,
        featureFlags,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching feature flags" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]/featureFlags
 * Update feature flags for a specific admin user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Only super admin can update feature flags
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();

    // Validate feature flags using Zod
    const validationResult = updateFeatureFlagsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid feature flags data",
          details:
            validationResult.error.message || "Invalid feature flags data",
        },
        { status: 400 }
      );
    }

    // Check if user exists and is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        featureFlags: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Feature flags can only be set for ADMIN users" },
        { status: 400 }
      );
    }

    // Merge existing flags with new flags
    const existingFlags =
      (user.featureFlags as Record<string, boolean>) ||
      getDefaultFeatureFlags();
    const updatedFlags = {
      ...existingFlags,
      ...validationResult.data,
    };

    // Update feature flags in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        featureFlags: updatedFlags,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        featureFlags: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Feature flags updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          featureFlags: updatedUser.featureFlags,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating feature flags:", error);
    return NextResponse.json(
      { error: "An error occurred while updating feature flags" },
      { status: 500 }
    );
  }
}
