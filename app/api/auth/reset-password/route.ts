import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendForgotPasswordEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, sendResetEmail } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    if (sendResetEmail) {
      const resetUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/reset-password?email=${encodeURIComponent(email)}`;

      await sendForgotPasswordEmail({
        userName: user.name,
        userEmail: user.email,
        resetUrl,
        expiresIn: "1 hour",
      }).catch(() => {
        console.error("Failed to send forgot password email");
      });

      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json(
      {
        message:
          "Password reset successful! You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred during password reset" },
      { status: 500 }
    );
  }
}
