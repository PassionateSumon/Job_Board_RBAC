import prisma from "../../../config/prisma";
import { statusCodes } from "../../../config/constants";
import { listAllJobsQuery } from "../type/job.type";

export const listAllJobsForAdminService = async (query: listAllJobsQuery) => {
  try {
    const { page = "1", limit = "10", sort, search, filter } = query;
    let whereClause: any = {};
    let orderBy: any = {};
    const [allJobs, total] = await Promise.all([
      prisma.job.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          applications: true,
          company: true,
          recruiter: true,
        },
        where: whereClause,
        orderBy,
      }),
      prisma.job.count(),
    ]);

    return {
      data: {
        jobs: allJobs,
        page,
        limit,
        totalPages: Math.ceil(total / Number(limit)),
      },
      message: "all jobs are fetched successfully...",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const listAllJobsForRecruiterService = async (userId: string, query: listAllJobsQuery) => {
  try {
    
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const listAllJobsService = async (query: listAllJobsQuery) => {
  try {
    const { page = "1", limit = "10", sort, search, filter } = query;
    let obj: any;
    if (filter) {
      try {
        obj = JSON.parse(filter);
      } catch (error) {
        return {
          message: "Filter can't be parsed!",
          statusCode: statusCodes.BAD_REQUEST,
        };
      }
    }

    let whereClause: any = {
      status: { contains: "open" },
    };
    let orderBy: any = {};

    const [allJobs, total] = await Promise.all([
      prisma.job.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          applications: true,
          company: true,
          recruiter: true,
        },
        where: whereClause,
        orderBy,
      }),
      prisma.job.count(),
    ]);

    return {
      data: {
        jobs: allJobs,
        page,
        limit,
        totalPages: Math.ceil(total / Number(limit)),
      },
      message: "all jobs are fetched successfully...",
      statusCode: statusCodes.SUCCESS,
    };
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};

export const getSingleJobService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const createJobService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const updateJobService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const updateJobStatusService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const deleteJobService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
export const getAllJobsPostingByRecruiterService = async () => {
  try {
  } catch (error) {
    return {
      message: "Internal server error at refresh-token service!",
      statusCode: statusCodes.SERVER_ISSUE,
    };
  }
};
