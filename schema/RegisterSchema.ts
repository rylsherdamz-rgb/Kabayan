import { z } from "zod"

const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters"),

  birthday: z
    .string()
    .min(1, "Birthday is required"),

  validId: z.any().refine((file) => file != null, {
    message: "Valid ID is required"
  }),

  resume: z.any().refine((file) => file != null, {
    message: "Resume is required"
  })
})

type RegisterType = z.infer<typeof RegisterSchema>