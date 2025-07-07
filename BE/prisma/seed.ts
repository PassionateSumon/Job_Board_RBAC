import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPermissions = [
  { name: "create_job", description: "Create a new job posting" },
  { name: "update_job", description: "Update a job posting" },
  { name: "delete_job", description: "Delete a job posting" },
  { name: "update_job_status", description: "Change a job status" },
  { name: "view_own_posted_job", description: "View own posted jobs" },
  { name: "view_own_applied_job", description: "View own applied jobs" },
  { name: "apply_job", description: "Apply to any job" },
  { name: "view_applications", description: "View job applications" },
  { name: "approve_job", description: "Approve a job posting" },
  { name: "reject_job", description: "Reject a job posting" },
  { name: "list_all_jobs", description: "Get all job posting for admin" },
  { name: "manage_roles", description: "Create/Update/Delete/Read roles" },
  {
    name: "manage_permissions",
    description: "Create/Update/Delete/Read permissions",
  },
];

const defaultRoles = [
  { name: "super_admin" },
  { name: "content_manager_admin" },
  { name: "recruiter" },
  { name: "job_seeker" },
];

const defaultRolePermissions = [
  // super_admin: all permissions
  ...defaultPermissions.map((perm) => ({
    roleName: "super_admin",
    permissionName: perm.name,
  })),
  // content_manager_admin
  { roleName: "content_manager_admin", permissionName: "approve_job" },
  { roleName: "content_manager_admin", permissionName: "reject_job" },
  { roleName: "content_manager_admin", permissionName: "list_all_jobs" },
  { roleName: "content_manager_admin", permissionName: "view_applications" },
  { roleName: "content_manager_admin", permissionName: "update_job_status" },
  // recruiter
  { roleName: "recruiter", permissionName: "create_job" },
  { roleName: "recruiter", permissionName: "update_job" },
  { roleName: "recruiter", permissionName: "delete_job" },
  { roleName: "recruiter", permissionName: "view_own_posted_job" },
  { roleName: "recruiter", permissionName: "view_applications" },
  { roleName: "recruiter", permissionName: "update_job_status" },
  // job_seeker
  { roleName: "job_seeker", permissionName: "apply_job" },
  { roleName: "job_seeker", permissionName: "view_own_applied_job" },
];

async function seed() {
  console.log("env file load...");
  try {
    // Seed permissions
    await prisma.permission.createMany({
      data: defaultPermissions,
      skipDuplicates: true,
    });
    console.log("Permissions seeded");

    // Seed roles
    await prisma.role.createMany({
      data: defaultRoles,
      skipDuplicates: true,
    });
    console.log("Roles seeded");

    // Seed role-permissions
    const rolePermissionsData: any = [];
    for (const rp of defaultRolePermissions) {
      const role = await prisma.role.findUnique({
        where: { name: rp.roleName },
      });
      const permission = await prisma.permission.findUnique({
        where: { name: rp.permissionName },
      });
      if (role && permission) {
        rolePermissionsData.push({
          roleId: role.id,
          permissionId: permission.id,
        });
      } else {
        console.warn(
          `Skipping RolePermission: Role ${rp.roleName} or Permission ${rp.permissionName} not found`
        );
      }
    }

    if (rolePermissionsData.length > 0) {
      await prisma.rolePermissions.createMany({
        data: rolePermissionsData,
        skipDuplicates: true,
      });
      console.log("RolePermissions seeded");
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
