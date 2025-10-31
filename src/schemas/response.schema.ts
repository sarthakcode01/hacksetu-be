import z from "zod";
export const responseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.any(), // or z.string() / z.number() depending on your form
    })
  ),
});
