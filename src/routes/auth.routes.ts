import type { Request, Response, Router } from "express";
import express, { response } from "express"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema } from "../schemas/user.schema.js";
import { loginSchema } from "../schemas/login.schema.js";
import client from "../config/db.js";
import "dotenv/config"

const router: Router = express.Router();






router.post("/register", async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse({ body: req.body });
        if (!parsed.success) {

            res.status(400).json({
                success: false,
                message: "data is missing"
            })
            return
        }
        const { fullName, email, password, role, city, college,orgName } = parsed.data.body;

        const isUser = await client.user.findUnique({
            where: {
                email: email
            }
        })

        if (isUser) {
            res.status(409).json({
                success: false,
                message: 'User already exists with this email.',
            });
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await client.user.create({
            data: {
                name: fullName,
                email,
                password: hashedPassword,
                role: role,
                city,
                college,
                orgName,
            },
        });

        res.status(201).json({ success:true,message: "User registered successfully", userId: user.id });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});


router.post("/login", async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse({ body: req.body });
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "data is missing"
            })
            return
        }
        const { email, password } = parsed.data.body;

        const isUser = await client.user.findUnique({
            where: {
                email,
            }
        })
        if (!isUser) {
            res.status(404).json({
                success: false,
                message: "user not found"
            })
            return
        }

        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign({ email: isUser.email, name: isUser.name, id: isUser.id }, process.env.JWT_SECRET!, {
            expiresIn: "24h",
        });

        // Send token back to frontend
        res.status(200).json({
            success:true,
            message: "Login successful",
            token,
            user: { name: isUser.name, email: isUser.email,role:isUser.role },
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/logout", async (req, res) => {
    try {
        localStorage.removeItem("token")
        response.status(200).json({
            success:true,
            message:"user is logged out"
        })

    } catch (error:any) {
        res.status(400).json({ message: error.message });

    }
})

export default router;
