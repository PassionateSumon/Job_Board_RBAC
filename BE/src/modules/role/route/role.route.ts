import express from "express";
import { createRoleHandler, getAllRolesHandler } from "../controller/role.controller";

const roleRouter = express.Router();

roleRouter.post("/create", createRoleHandler);
roleRouter.get("/get-all-roles", getAllRolesHandler); // later middleware will be added

export default roleRouter;