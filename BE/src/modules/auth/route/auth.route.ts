import express from "express";
import {
  acceptAdminRequestHandler,
  inviteAdminsRequestHandler,
  loginHandler,
  refreshHandler,
  signupHandler,
} from "../controller/auth.controller";

const authRouter = express.Router();

authRouter.post("/signup", signupHandler);
authRouter.post("/admin/invite", inviteAdminsRequestHandler);
authRouter.post("/admin/invite/accept", acceptAdminRequestHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/refresh", refreshHandler);

export default authRouter;
