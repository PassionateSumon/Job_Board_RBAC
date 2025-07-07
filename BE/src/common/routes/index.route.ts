import express from "express";
import authRouter from "src/modules/auth/route/auth.route";
import roleRouter from "src/modules/role/route/role.route";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/role", roleRouter);

export default router;
