import express from "express"
import authRouter from "./routes/auth.routes.js"
import formRouter from "./routes/form.routes.js"
import { authMiddleware } from "./middleware/auth.middleware.js"
import userRouter from "./routes/user.routes.js"
import reseponseRouter from "./routes/response.routes.js"
import cors from "cors"


const app = express()
app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.send("hi")
})

app.use("/auth",authRouter)
app.use("/form",authMiddleware, formRouter)
app.use("/user",authMiddleware, userRouter)
app.use("/response",authMiddleware, reseponseRouter)

app.listen(3000,()=>console.log("app is runnning"))