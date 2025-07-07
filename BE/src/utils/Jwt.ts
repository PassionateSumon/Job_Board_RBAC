import jwt from "jsonwebtoken";

const JWT_INVITE_SECRET = process.env.JWT_INVITE_SECRET!;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export class Jwt {
  static generateToken({ userId, email }: { userId: string; email: string }) {
    const token = jwt.sign({ userId, email }, JWT_INVITE_SECRET, {
      expiresIn: "24h",
    });
    return token;
  }

  static verifyToken(token: string) {
    const decoded = jwt.verify(token, JWT_INVITE_SECRET) as {
      userId: string;
      email: string;
    };
    return decoded;
  }

  static generateAuthTokens({
    userId,
    roleId,
  }: {
    userId: string;
    roleId: string;
  }) {
    const generatedAccessToken = jwt.sign(
      { userId, roleId },
      JWT_ACCESS_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const generatedRefreshToken = jwt.sign(
      { userId, roleId },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return { generatedAccessToken, generatedRefreshToken };
  }
  static verifyAccessToken(token: string) {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      userId: string;
      roleId: string;
    };
    return decoded;
  }
  static verifyRefreshToken(token: string) {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      roleId: string;
    };
    return decoded;
  }
}
