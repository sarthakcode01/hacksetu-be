import { z } from "zod";


// question SChema
// ------------------------------------------------------------------
export const questionSchema = z
  .object({
    id:z.number().optional(),
    text: z
      .string()
      .min(3, "Question text must be at least 3 characters long"),
    type: z.enum([
      "SHORT_TEXT",
      "PARAGRAPH",
      "MULTIPLE_CHOICE",
      "CHECKBOX",
      "DROPDOWN",
      "DATE",
      "FILE_UPLOAD",
    ]),
    required: z.boolean().default(false),
    options: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (
      ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(data.type) &&
      data.options.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Options must not be empty for ${data.type} type`,
        path: ["options"],
      });
    }
  });
export const formSchema = z.object({
  title: z
    .string()
    .min(3, "Form title must be at least 3 characters long")
    .max(100, "Form title is too long"),
  description: z.string().optional(),
  questions: z
    .array(questionSchema)
    .min(1, "Form must have at least one question"),
});
