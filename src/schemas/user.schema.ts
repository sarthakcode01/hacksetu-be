import { z } from "zod";

const ROLE=["ORGANIZATION","USER","ADMIN"] as const
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role:z.enum(ROLE),
    orgName:z.string().optional(),
    college:z.string().optional(),
    city:z.string().optional()
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
