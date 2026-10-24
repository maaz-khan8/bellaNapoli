import { z } from "zod";

/**
 * Customer-facing schemas. Messages are translation keys (messages/<locale>.json → "validation"),
 * resolved by <FormField>, so the same schema works in every language.
 */

/** Accepts common formats like (212) 555-0123, 212.555.0123 or +1 212 555 0123 */
export const isValidPhone = (v: string) => /^\+?[\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15;

const phone = z.string().trim().min(1, "validation.phoneRequired").refine(isValidPhone, "validation.phoneInvalid");
const email = z.string().trim().min(1, "validation.emailRequired").email("validation.emailInvalid");
const password = z
  .string()
  .min(8, "validation.passwordLength")
  .regex(/[A-Z]/, "validation.passwordUppercase")
  .regex(/[0-9]/, "validation.passwordNumber");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "validation.passwordRequired"),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "validation.nameRequired"),
    email,
    phone,
    password,
    confirm: z.string().min(1, "validation.confirmRequired"),
    terms: z.boolean().refine((v) => v, "validation.termsRequired"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "validation.passwordMismatch" });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email });

export const addressSchema = z.object({
  label: z.string().trim().min(1, "validation.labelRequired"),
  line1: z.string().trim().min(5, "validation.streetRequired"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "validation.cityRequired"),
  postalCode: z.string().trim().regex(/^\d{5}$/, "validation.zipInvalid"),
  notes: z.string().trim().max(120, "validation.notesTooLong").optional(),
  isDefault: z.boolean(),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, "validation.nameRequired"),
    phone,
    email,
    fulfillment: z.enum(["delivery", "pickup"]),
    addressId: z.string(),
    line1: z.string().trim(),
    city: z.string().trim(),
    postalCode: z.string().trim(),
    instructions: z.string().trim().max(200, "validation.instructionsTooLong"),
    paymentMethod: z.literal("cod", { message: "validation.paymentRequired" }),
    saveAddress: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.fulfillment !== "delivery" || v.addressId !== "new") return;
    if (v.line1.length < 5) ctx.addIssue({ code: "custom", path: ["line1"], message: "validation.streetRequired" });
    if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "validation.cityRequired" });
    if (!/^\d{5}$/.test(v.postalCode)) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "validation.zipInvalid" });
  });
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "validation.nameRequired"),
  email,
  phone,
});
export type ProfileValues = z.infer<typeof profileSchema>;
