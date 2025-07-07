import { Request, Response } from "express";
import { statusCodes } from "../../../config/constants";
import { error, success } from "../../../utils/returnFunctions";
import { createRoleService, getAllRolesService } from "../service/role.service";

export const createRoleHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload = req.body;
    const user = (req as any).user;
    const result = await createRoleService(payload, user);
    if (result.statusCode !== statusCodes.SUCCESS) {
      return error(null, result.message, result.statusCode)(res);
    }
    return success(result.data, result.message, result.statusCode)(res);
  } catch (err: any) {
    return error(
      null,
      err.message || "Internal server error at create role handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};

export const getAllRolesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await getAllRolesService();
    if (result.statusCode !== statusCodes.SUCCESS) {
      return error(null, result.message, result.statusCode)(res);
    }
    return success(result.data, result.message, result.statusCode)(res);
  } catch (err: any) {
    return error(
      null,
      err.message || "Internal server error at get all roles handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};
