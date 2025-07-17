import * as z from "zod";

export const profileEditSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name cannot exceed 50 characters."
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }).max(50, {
    message: "First name cannot exceed 50 characters."
  }).optional().or(z.literal('')),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }).max(50, {
    message: "Last name cannot exceed 50 characters."
  }).optional().or(z.literal('')),
  bio: z.string().max(500, {
    message: "Bio cannot exceed 500 characters."
  }).optional().or(z.literal('')),
  city: z.string().max(50, {
    message: "City cannot exceed 50 characters."
  }).optional().or(z.literal('')),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number cannot exceed 15 digits." })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number." })
    .optional()
    .or(z.literal('')),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;