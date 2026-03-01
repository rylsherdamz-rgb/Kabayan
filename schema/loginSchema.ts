import * as z from "zod"

const passwordSchema = z
  .string()
  .min(1,{ message: "Password is required" }) 
  .min(8,{ message: "Password must be at least 8 characters" })
  .max(20,{ message: "Password must be less than 20 characters" })
  .refine((val) => /[A-Z]/.test(val),{
    message: "Password must contain at least one uppercase letter"})
  .refine((val) => /[a-z]/.test(val),{
    message: "Password must contain at least one lowercase letter"})
  .refine((val) => /[0-9]/.test(val),{
    message: "Password must contain at least one number"})
  .refine((val) => /[!@#$%^&*]/.test(val),{
    message: "Password must contain at least one special character"});

export const RegisterFormSchema = z.object({
  email: z.email(), 
  password: passwordSchema
});

export type RegisterFormType = z.infer<typeof RegisterFormSchema>