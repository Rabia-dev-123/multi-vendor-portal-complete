import { z } from "zod";

// Base user schema
export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "VENDOR"], {
      message: "Role is required",
    }),

    // Vendor fields
    companyName: z.string().max(200).optional(),
    phoneNumber: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    taxId: z.string().max(50).optional(),
    autoApprove: z.boolean().optional(),

    // Admin fields
    designation: z.string().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate vendor-specific required fields
    if (data.role === "VENDOR") {
      if (!data.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required for vendors",
          path: ["companyName"],
        });
      }
    }
  });

// Update user schema (password optional)
export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100).optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .optional()
      .or(z.literal("")),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "VENDOR"]).optional(),

    // Vendor fields
    companyName: z.string().max(200).optional(),
    phoneNumber: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    taxId: z.string().max(50).optional(),

    // Admin fields
    designation: z.string().max(100).optional(),
  })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
