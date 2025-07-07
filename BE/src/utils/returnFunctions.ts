import type { Response } from "express";
import { statusCodes } from "src/config/constants";

export const success = (
  data: any,
  message: string = "Success",
  statusCode: number = statusCodes.SUCCESS
) => {
  return (res: Response) => {
    return res.status(statusCode).json({
      data,
      message,
      statusCode,
    });
  };
};

export const error = (
  data: any,
  message: string = "Error",
  statusCode: number = statusCodes.BAD_REQUEST
) => {
  return (res: Response) => {
    return res.status(statusCode).json({
      data,
      message,
      statusCode,
    });
  };
};
