import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    },
    name: "ra_session",
  }),
);

const uploadMarksLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => req.session?.userId ?? "anon",
  message: { error: "Too many upload requests. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
});

const whatsappSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.session?.userId ?? "anon",
  message: { error: "WhatsApp send limit reached. Please wait an hour." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
});

const studentMutateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req: any) => req.session?.userId ?? "anon",
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
});

app.use("/api/teacher/upload-marks", uploadMarksLimiter);
app.use("/api/teacher/whatsapp/send", whatsappSendLimiter);
app.post("/api/students", studentMutateLimiter);
app.patch("/api/students", studentMutateLimiter);
app.delete("/api/students", studentMutateLimiter);

app.use("/api", router);

export default app;
