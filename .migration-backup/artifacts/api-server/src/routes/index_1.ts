import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import teacherRouter from "./teacher";
import studentRouter from "./student";
import adminRouter from "./admin";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(teacherRouter);
router.use(studentRouter);
router.use(adminRouter);
router.use(pushRouter);

export default router;
