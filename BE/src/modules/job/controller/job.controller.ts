import { Request, Response } from "express";
import { statusCodes } from "../../../config/constants";
import { error, success } from "../../../utils/returnFunctions";
import { listAllJobsForAdminService } from "../service/job.service";
import { listAllJobsQuery } from "../type/job.type";

export const listAllJobsForAdminHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const query = req.query as unknown as listAllJobsQuery;
    const result = await listAllJobsForAdminService(query);
    if (result.statusCode !== statusCodes.SUCCESS) {
      return error(null, result.message, result.statusCode)(res);
    }
    return success(result.data, result.message, result.statusCode)(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at list_all_jobs_admin handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};
