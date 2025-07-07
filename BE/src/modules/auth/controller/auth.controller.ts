import type { Request, Response } from "express";
import { error, success } from "../../../utils/returnFunctions";
import { statusCodes } from "../../../config/constants";
import {
  acceptAdminRequestService,
  inviteAdminRequestService,
  loginService,
  refreshService,
  signupService,
} from "../service/auth.service";
import type {
  AcceptAdminRequestPayload,
  inviteAdminRequestPayload,
  loginPayload,
  SignupPayload,
} from "../type/auth.type";

export const signupHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload = req.body as SignupPayload;
    const result = await signupService(payload);
    if (result.statusCode !== statusCodes.CREATED) {
      return error(
        null,
        result.message || "Error while signup!",
        result.statusCode
      )(res);
    }
    return success(
      result.data,
      result.message || "Signed up successfully..",
      statusCodes.CREATED
    )(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at signup handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};

export const inviteAdminsRequestHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload = req.body as inviteAdminRequestPayload;
    const result = await inviteAdminRequestService(payload);
    if (result.statusCode !== 200) {
      return error(
        null,
        result.message || "Error while invite admin!",
        result.statusCode
      )(res);
    }
    return success(
      result.data,
      result.message || "Invite successfully..",
      statusCodes.CREATED
    )(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at invite admin handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};

export const acceptAdminRequestHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload = req.body as AcceptAdminRequestPayload;
    const result = await acceptAdminRequestService(payload);
    if (result.statusCode !== 200) {
      return error(
        null,
        result.message || "Error while accept invite!",
        result.statusCode
      )(res);
    }
    return success(
      result.data,
      result.message || "Accept invite successfully..",
      statusCodes.CREATED
    )(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at accept admin handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload = req.body as loginPayload;
    const result = await loginService(payload);
    if (result.statusCode !== statusCodes.SUCCESS) {
      return error(
        null,
        result.message || "Error while accept invite!",
        result.statusCode
      )(res);
    }

    const { accessToken, refreshToken, user } = result.data as any;

    const encodedAccessToken = Buffer.from(accessToken).toString("base64");
    const encodedRefreshToken = Buffer.from(refreshToken).toString("base64");

    res.cookie("accessToken", encodedAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", encodedRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(
      { user },
      result.message || "Login successfull..",
      statusCodes.SUCCESS
    )(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at login handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const getEncodedRefreshToken = req.cookies.refreshToken;
    if (!getEncodedRefreshToken) {
      return error(null, "No refresh token is provided or found!")(res);
    }

    const getRefreshToken = Buffer.from(
      getEncodedRefreshToken,
      "base64"
    ).toString("utf-8");
    const result = await refreshService(getRefreshToken);
    if (result.statusCode !== statusCodes.SUCCESS) {
      return error(
        null,
        result.message || "Error refreshing token!",
        result.statusCode
      )(res);
    }

    const { accessToken, refreshToken } = result.data as any;
    const encodedAccessToken = Buffer.from(accessToken).toString("base64");
    const encodedRefreshToken = Buffer.from(refreshToken).toString("base64");

    res.cookie("accessToken", encodedAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", encodedRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(
      null,
      result.message || "Login successfull..",
      statusCodes.SUCCESS
    )(res);
  } catch (err: any) {
    console.error(err);
    return error(
      null,
      err.message || "Internal server error at refresh-token handler!",
      statusCodes.SERVER_ISSUE
    )(res);
  }
};
