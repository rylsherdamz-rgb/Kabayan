import * as z from "zod"

export const userSchema =  z.object({
    gmail : z.email().lowercase()
})