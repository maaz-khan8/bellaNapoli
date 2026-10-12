import { z } from "zod";

/** Accepts common formats like (212) 555-0123, 212.555.0123 or +1 212 555 0123 */
export const isValidPhone = (v: string) => /^\+?[\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15;

const phone = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidPhone, "Enter a valid phone number, e.g. (212) 555-0123");
const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    email,
    phone,
    password,
    confirm: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((v) => v, "Please accept the demo terms to continue"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email });

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label, e.g. Home"),
  line1: z.string().trim().min(5, "Enter a street address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter a city"),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  notes: z.string().trim().max(120, "Keep notes under 120 characters").optional(),
  isDefault: z.boolean(),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    phone,
    email,
    fulfillment: z.enum(["delivery", "pickup"]),
    addressId: z.string(),
    line1: z.string().trim(),
    city: z.string().trim(),
    postalCode: z.string().trim(),
    instructions: z.string().trim().max(200, "Keep instructions under 200 characters"),
    paymentMethod: z.literal("cod", { message: "Please choose a payment method" }),
    saveAddress: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.fulfillment !== "delivery" || v.addressId !== "new") return;
    if (v.line1.length < 5) ctx.addIssue({ code: "custom", path: ["line1"], message: "Enter your street address" });
    if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your city" });
    if (!/^\d{5}$/.test(v.postalCode)) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a 5-digit ZIP code" });
  });
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email,
  phone,
});
export type ProfileValues = z.infer<typeof profileSchema>;
