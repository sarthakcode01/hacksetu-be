import express, { Router, type Request, type Response } from "express"
import client from "../config/db.js";
import { responseSchema } from "../schemas/response.schema.js";

const router:Router= express.Router()

router.post('/submit-response/:formId', async (req: Request, res: Response) => {
  try {
    const parsed = responseSchema.parse(req.body);
    //@ts-ignore 
    const userId = req.user.id;
    const { formId } = req.params;
    if(!formId) return res.status(400).json({ error: "form id is not available" })

    // 2. Check if form exists and is live
    const form = await client.form.findUnique({ 
      where: { id: formId } 
    });
    
    if (!form || form.status !== "LIVE") {
      return res.status(400).json({ error: "Form not available" });
    }

    // 3. Create response with answers in one go
    const responseData = await client.response.create({
      data: {
        formId,
        userId,
        answers: {
          create: parsed.answers
        }
      },
      include: {
        answers: true
      }
    });
    
    return res.status(201).json({ 
      success: true, 
      responseId: responseData.id 
    });
    
  } catch (error: any) {
    console.error('Submit error:', error);
    return res.status(400).json({ error: "Failed to submit form" });
  }
});



router.get('/:formId/responses', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    //@ts-ignore
    const userId = req.user.id;
    
    // Check if user owns the form
    const form = await client.form.findFirst({
      where: { 
        id: formId,
        ownerId: userId 
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!form) {
      return res.status(403).json({ error: "Form not found or access denied" });
    }
    
    // Get all responses with answers
    const responses = await client.response.findMany({
      where: { formId },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ 
      form: {
        id: form.id,
        title: form.title,
        totalResponses: responses.length,
        questions: form.questions
      },
      responses 
    });
    
  } catch (error: any) {
    console.error('Get responses error:', error);
    return res.status(500).json({ error: "Failed to fetch responses" });
  }
});
export default router