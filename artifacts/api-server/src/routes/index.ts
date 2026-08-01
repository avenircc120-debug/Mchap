import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publishRouter from "./publish";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publishRouter);

export default router;
