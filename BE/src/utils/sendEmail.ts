import { queueEmail } from "../common/service/emailQueue";
import dotenv from "dotenv";
dotenv.config();

export const sendInviteEmailToAdmin = async (
  user: any,
  tempPassword: string,
  inviteToken: string,
  role: string
) => {
  const resetUrl = `${process.env.DEV_ORIGIN}/reset-password`;
  const emailContent = `
    Hi,\nYou have been invited to join as ${role}. Activate your account by resetting your password: ${resetUrl}?token=${inviteToken}&email=${user.email}\nTemporary password: ${tempPassword}
  `;
  await queueEmail({
    to: user.email,
    subject: "Invitation to Join Job Board",
    text: emailContent,
  });
};

export const sendAccountOpeningMailToNonAdmin = async (
  user: any,
  role: string
) => {
  const loginUrl = `${process.env.DEV_ORIGIN}/login`;
  const emailContent = `
    Hi ${user.firstName},\nYour account as ${role} has been created successfully. Log in at ${loginUrl}.
  `;
  await queueEmail({
    to: user.email,
    subject: "Welcome to Job Board",
    text: emailContent,
  });
};
