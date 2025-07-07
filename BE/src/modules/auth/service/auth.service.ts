import { statusCodes } from "../../../config/constants";
import type {
  AcceptAdminRequestPayload,
  inviteAdminRequestPayload,
  loginPayload,
  SignupPayload,
} from "../type/auth.type";
import prisma from "../../../config/prisma";
import { Bcrypt } from "../../../utils/Bcrypt";
import {
  sendAccountOpeningMailToNonAdmin,
  sendInviteEmailToAdmin,
} from "../../../utils/sendEmail";
import { Jwt } from "../../../utils/Jwt";

export const signupService = async (payload: SignupPayload) => {
  try {
    const { firstName, lastName, email, password, role } = payload;

    console.log("1");
    const isExisted = await prisma.user.findUnique({
      where: { email },
    });
    console.log("2");
    if (isExisted) {
      return {
        message: "Email already exists!",
        statusCode: statusCodes.FORBIDDEN,
      };
    }

    console.log("3");
    const isRoleExists = (await prisma.role.findUnique({
      where: { name: role },
    })) as any;
    console.log("4", isRoleExists);
    let created: any;
    if (!isRoleExists) {
      created = await prisma.role.create({
        data: {
          name: role,
        },
      });
      console.log("5", created);
      if (!created) {
        return {
          message: "Role can not be created!",
          statusCode: statusCodes.BAD_REQUEST,
        };
      }
      console.log("6");
    }
    console.log("7", created);
    const hashedPassword = await Bcrypt.hashPassword(password);
    console.log("8", hashedPassword);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName ? lastName : "",
        email,
        password: hashedPassword,
        roleId: isRoleExists.id || created.id,
      },
    });
    console.log("9");

    if (!newUser) {
      return {
        message: "User is not created for intrnal reason!",
        statusCode: statusCodes.SERVER_ISSUE,
      };
    }
    console.log("10");

    try {
      await sendAccountOpeningMailToNonAdmin(newUser, role);
      console.log("11");
    } catch (error) {
      return {
        message: "Failed to send mail of new account opening!",
        statusCode: statusCodes.SERVER_ISSUE,
      };
    }
    console.log("12");

    return {
      data: null,
      message: "Signed up successfully..",
      statusCode: statusCodes.CREATED,
    };
  } catch (error) {
    return {
      message: "Internal server error at signup service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const inviteAdminRequestService = async (
  payload: inviteAdminRequestPayload
) => {
  try {
    const { firstName, email, role } = payload;

    const isExisted = await prisma.user.findUnique({
      where: { email },
    });
    if (isExisted) {
      return {
        message: "Email already exists!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const isRoleExists = (await prisma.role.findUnique({
      where: { name: role },
    })) as any;
    if (isRoleExists) {
      return {
        message: "Role does not exist!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const tempPassword = Math.random().toString(36);
    const hashedPassword = await Bcrypt.hashPassword(tempPassword);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        email,
        password: hashedPassword,
        roleId: isRoleExists.id,
      },
    });

    const inviteToken = Jwt.generateToken({
      userId: newUser.id,
      email: newUser.email,
    });
    if (!inviteToken) {
      return {
        message: "Internal server error while generating invite token!",
        statusCode: statusCodes.SERVER_ISSUE,
      };
    }

    await prisma.token.create({
      data: {
        userId: newUser.id,
        token: inviteToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    try {
      await sendInviteEmailToAdmin(newUser, tempPassword, inviteToken, role);
    } catch (error) {
      return {
        message: "Failed to send mail of invite admin!",
        statusCode: statusCodes.SERVER_ISSUE,
      };
    }

    return {
      data: { userId: newUser.id },
      message: "Invite an Admin to join Job Board successfully..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at invite admin service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const acceptAdminRequestService = async (
  payload: AcceptAdminRequestPayload
) => {
  try {
    const { email, token, newPassword } = payload;

    const decoded = Jwt.verifyToken(token) as {
      userId: string;
      email: string;
    };
    if (decoded.email !== email) {
      return {
        message: "Token is invalid!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });
    if (!user || user.status !== "pending") {
      return {
        message: "Invalid or expired invotation!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const existingToken = await prisma.token.findFirst({
      where: {
        userId: user.id,
        token,
        expiresAt: { gt: new Date() },
      },
    });
    if (!existingToken) {
      return {
        message: "Invalid or expired token!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const hashedPassword = await Bcrypt.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, status: "active" },
    });

    await prisma.token.delete({ where: { id: existingToken.id } });

    return {
      data: null,
      message: "Admin accpeted request & account activated successfully..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at accept admin service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const loginService = async (payload: loginPayload) => {
  try {
    const { email, password } = payload;

    const existedUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!existedUser) {
      return {
        message: "User does not exist with this email!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }
    if (existedUser.status === "inactive" || existedUser.status === "blocked") {
      return {
        message:
          "You are not allowed to log in as account is inactive or blocked!",
        statusCode: statusCodes.FORBIDDEN,
      };
    }

    const isPasswordMatched = await Bcrypt.comparePassword(
      password,
      existedUser.password
    );
    if (!isPasswordMatched) {
      return {
        message: "Password is not matched!",
        statusCode: statusCodes.BAD_REQUEST,
      };
    }

    const { generatedAccessToken, generatedRefreshToken } =
      Jwt.generateAuthTokens({
        userId: existedUser.id,
        roleId: existedUser.roleId,
      });

    const addUserRefreshToken = await prisma.refreshToken.create({
      data: {
        userId: existedUser.id,
        token: generatedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    if (!addUserRefreshToken) {
      return {
        message: "Refresh token is not added to schema for internal issue!",
        statusCode: statusCodes.SERVER_ISSUE,
      };
    }

    return {
      data: {
        accessToken: generatedAccessToken,
        refreshToken: generatedRefreshToken,
        user: {
          id: existedUser.id,
          email: existedUser.email,
          role: existedUser.role.name,
        },
      },
      message: "Login successful..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at login service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const refreshService = async (refreshToken: string) => {
  try {
    const decoded = Jwt.verifyRefreshToken(refreshToken);
    const existingToken = await prisma.token.findFirst({
      where: {
        userId: decoded.userId,
        token: refreshToken,
        expiresAt: { gt: new Date() },
      },
    });
    if (!existingToken) {
      return {
        message: "Token is not existed or invalid token!",
        statusCode: statusCodes.UNAUTHORIZED,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.status !== "active") {
      return {
        message: "Invalid or inactive user!",
        statusCode: statusCodes.UNAUTHORIZED,
      };
    }

    const { generatedAccessToken, generatedRefreshToken } =
      Jwt.generateAuthTokens({
        userId: user.id,
        roleId: user.roleId,
      });

    return {
      data: {
        accessToken: generatedAccessToken,
        refreshToken: generatedRefreshToken,
      },
      message: "Token refreshed successfully..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
