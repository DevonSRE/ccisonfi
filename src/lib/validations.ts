import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name is too long"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(30, "Phone number is too long"),
  organisation: z
    .string()
    .min(2, "Organisation must be at least 2 characters")
    .max(255, "Organisation name is too long"),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters")
    .max(255, "Designation is too long"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
