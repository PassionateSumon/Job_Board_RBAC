import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import prisma from "./config/prisma";
import router from "./common/routes/index.route";
dotenv.config();

const environment = process.env.ENVIRONMENT;
const ORIGIN =
  environment === "dev" ? process.env.DEV_ORIGIN : process.env.PROD_ORIGIN;
const PORT = process.env.PORT || 3333;

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
); // rate limit

// index route
app.use("/api/v1", router);

async function startServer() {
  try {
    // connect prisma
    await prisma.$connect();
    console.log("Database connected...");

    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", async () => {
  // disconnect prisma
  await prisma.$disconnect();
  process.exit(1);
});
process.on("SIGINT", async () => {
  // disconnect prisma
  await prisma.$disconnect();
  process.exit(1);
});
