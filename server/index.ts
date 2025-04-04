import { json, Request, Response } from "express";
import { app, io, server } from "./socket/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();
const PORT: string | 3000 = process.env.PORT || 3000;

app.use(json()); // parsing application/json
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173", // Allow only requests from this origin
  methods: "GET,POST,PUT,DELETE,PATCH ", // Allow only these methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow only these headers
  preflightContinue: false, // Ignore preflight requests
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is our chat application.");
});

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// @TODO :Add web socket.io
// @TODO : Setup server for deployment
