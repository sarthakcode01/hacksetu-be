import express from "express"
import type { Request, Response, Router } from "express"
import client from "../config/db.js"
import { formSchema } from "../schemas/form.schema.js"
import { truncate } from "fs/promises"
import { success } from "zod"

const router: Router = express.Router()

router.post("/create-form", async (req: Request, res: Response) => {
  try {
    const parsed = formSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(parsed.error.format())
      res.status(400).json({
        success: false,
        message: "data is missing"
      })
      return
    }

    const { title, description, questions } = parsed.data;
    //@ts-ignore
    const userId = req?.user?.id

    const form = await client.form.create({
      data: {
        title,
        description,
        ownerId: userId,
        status: "LIVE",
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options,
            order: index,
          })),
        },
      },
    });
    const updatedForm = await client.form.update({
      where: {
        id: form.id
      },
      data: {
        shareURL: form.id
      }
    })

    res.status(201).json({ success: true, message: "Form created successfully", form: updatedForm });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid form data",
        errors: err,
      });
    }
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
)

router.get("/my-forms", async (req: Request, res) => {
  try {
    // @ts-ignore
    const userId = req.user?.id; // assuming user is authenticated
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const forms = await client.form.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

   
    const formatted = forms.map((f) => ({
      formId: f.id,
      title: f.title,
      status: f.status,
      totalResponses: f._count.responses,
      createdAt: f.createdAt,
    }));

    res.status(200).json({
      success:true,
      forms:formatted
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
})


router.get("/get-form-by-id/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    const form = await client.form.findUnique({
      where: { id: formId },
      include: {
        questions: true, owner: { select: { orgName: true } },
      }
    });
    if (!form) return res.status(404).json({ error: "Form not found." });
    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/show-all-available-forms", async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Fetch all published forms
    const forms = await client.form.findMany({
      where: {
        status: "LIVE",
        responses: {
          none: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        shareURL: true,
        owner: { select: { orgName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedForms = forms.map(({ createdAt, owner, ...rest }) => ({
      ...rest,
      company: owner.orgName
    }))

    res.json({
      success: true,
      forms: transformedForms
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.post("/update-from/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    const { formTitle, formDesc } = req.body;

    const form = await client.form.update({
      where: { id: formId },
      data: { title: formTitle, description: formDesc },
    });
    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.delete("/delete-form/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    await client.form.delete({ where: { id: formId } });
    res.json({ success: true, message: "Form deleted." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/publish-form/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    const form = await client.form.update({
      where: { id: formId },
      data: { status: "LIVE" },
    });
    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/draft-form/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    const form = await client.form.update({
      where: { id: formId },
      data: { status: "DRAFT" },
    });
    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

router.get("/closed-form/:formId", async (req: Request, res) => {
  try {
    const { formId } = req.params;
    const form = await client.form.update({
      where: { id: formId },
      data: { status: "CLOSED" },
    });
    res.json({ success: true, form });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})

export default router