import rateLimit from "express-rate-limit";

export const uploadMarksLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Try again in a minute." },
});

export const whatsappSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "WhatsApp send limit reached. Try again in an hour." },
});

export const studentMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many student operations. Slow down." },
});
