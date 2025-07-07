import prisma from "../../../config/prisma";
import { statusCodes } from "../../../config/constants";
import { CreateOrUpdateRolePayload } from "../type/role.type";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validation/role.validatation";

export const createRoleService = async (
  payload: CreateOrUpdateRolePayload,
  user: any
) => {
  try {
    const { name, permissionIds } = createRoleSchema.parse(payload);
    const existed = await prisma.role.findUnique({ where: { name } });
    if (existed) {
      return {
        message: "Role name already exists!",
        statusCode: statusCodes.FORBIDDEN,
      };
    }
    if (permissionIds?.length) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        return {
          message: "Invalid permission IDs",
          statusCode: statusCodes.BAD_REQUEST,
        };
      }
    }
    const createdRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: { name },
      });

      if (permissionIds?.length) {
        await tx.rolePermissions.createMany({
          data: permissionIds.map((id) => ({
            roleId: role.id,
            permissionId: id,
          })),
          skipDuplicates: true,
        });
      }

      return role;
    });

    // Log action to AuditLog
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "create_role",
        details: { roleId: createdRole.id, name, permissionIds },
      },
    });

    return {
      data: createdRole,
      message: "Role created successfully",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error: any) {
    console.error(error);
    return {
      message: "Server error at create role service",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const getAllRolesService = async () => {
  try {
    const allRoles = await prisma.role.findMany();
    return {
      data: allRoles,
      message: "Fetched roles successfully..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Server error at get all roles service",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const getSingleRoleService = async (id: string) => {
  try {
    const askedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
    if (!askedRole) {
      return {
        message: "Not found the role!",
        statusCode: statusCodes.NOT_FOUND,
      };
    }
    return {
      data: askedRole,
      message: "Fetched the role successfully..",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at the get single role service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const updateRoleService = async (
  id: string,
  payload: CreateOrUpdateRolePayload,
  user: any
) => {
  try {
    const { name, permissionIds } = updateRoleSchema.parse(payload);

    const askedRole = await prisma.role.findUnique({
      where: { id },
    });
    if (!askedRole) {
      return {
        message: "Role not found!",
        statusCode: statusCodes.NOT_FOUND,
      };
    }

    //check for duplicate role name
    if (name && name !== askedRole.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name },
      });
      if (existingRole) {
        return {
          message: "Role with given name is already exist!",
          statusCode: statusCodes.CONFLICT,
        };
      }
    }

    // validate permission Ids
    let permissionsToAdd: string[] = [];
    if (permissionIds?.length) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        return {
          message: "One or more permission Ids are not valid!",
          statusCode: statusCodes.BAD_REQUEST,
        };
      }
      permissionsToAdd = permissionIds;
    }

    //update role and permissions in a transaction
    const updatedRole = await prisma.$transaction(async (tx) => {
      // update role name if provided
      const roleUpdate = await tx.role.update({
        where: { id },
        data: { name: name || askedRole.name },
      });

      // update permission efficiently
      if (permissionIds !== undefined) {
        // fecth current role-permissions
        const currentRolePermissions = await tx.rolePermissions.findMany({
          where: { roleId: roleUpdate.id },
          select: { permissionId: true },
        });
        const currentRolePermissionIds = new Set(
          currentRolePermissions.map((crp) => crp.permissionId)
        );

        // Calculate permissions to add (haven't in current but have in permissionIds)
        const permissionsToAddSet = new Set(permissionsToAdd);
        const permissionsToCreate =
          permissionIds.filter((pId) => !currentRolePermissionIds.has(pId)) ||
          [];

        // Calculate permissions to remove (have in current but haven't in permissionIds)
        const permissionsToRemove =
          currentRolePermissionIds.size > 0
            ? Array.from(currentRolePermissionIds).filter(
                (crp) => !permissionsToAddSet.has(crp)
              )
            : [];

        // Execute creates and deletes
        const operations = [];
        if (permissionsToCreate.length > 0) {
          operations.push(
            tx.rolePermissions.createMany({
              data: permissionsToCreate.map((pId) => ({
                roleId: roleUpdate.id,
                permissionId: pId,
              })),
              skipDuplicates: true,
            })
          );
        }
        if (permissionsToRemove.length > 0) {
          operations.push(
            tx.rolePermissions.deleteMany({
              where: {
                roleId: roleUpdate.id,
                permissionId: { in: permissionsToRemove },
              },
            })
          );
        }

        // Run the operation
        await Promise.all(operations);
      }

      return roleUpdate;
    });

    // Log action to AuditLog
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "update_role",
        details: { roleId: updatedRole.id, name, permissionIds },
      },
    });

    return {
      data: updatedRole,
      message: "Role updated successfully",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Internal server error at the update role service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const deleteRoleService = async () => {
  try {
  } catch (error) {
    console.error(error);
    return {
      message: "Internal server error at the delete role service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
