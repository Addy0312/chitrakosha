import * as z from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }).max(50, {
    message: "First name cannot exceed 50 characters."
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }).max(50, {
    message: "Last name cannot exceed 50 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).max(100, {
    message: "Email cannot exceed 100 characters."
  }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number cannot exceed 15 digits." })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number." })
    .optional()
    .or(z.literal('')),
  city: z.string().max(50, {
    message: "City cannot exceed 50 characters."
  }).optional(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).max(100, {
    message: "Password cannot exceed 100 characters."
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
  }).regex(/^(?=.*[!@#$%^&*])/, {
    message: "Password must contain at least one special character (!@#$%^&*).",
  }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Please enter your password.",
  }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;