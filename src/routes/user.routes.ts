import express, { Router } from "express"
import client from "../config/db.js"


const router: Router = express.Router()

router.get("/get-profile", async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.user.id
        const user = await client.user.findUnique({
            where: { id: userId},
            select: { id: true, name: true, email: true, role: true, createdAt: true ,forms:true,},
        });
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

router.post("/update-profile",async(req,res)=>{
  try {
    const { name } = req.body;
    //@ts-ignore
    const userId = req.user.id
    const user = await client.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
})


export default router