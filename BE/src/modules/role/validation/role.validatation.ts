import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Must not be empty!"),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Must not be empty!").optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});
