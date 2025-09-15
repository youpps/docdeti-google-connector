import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { google } from "googleapis";
import morgan from "morgan";
import { Controllers } from "./controllers";
import { Repositories } from "./repositories";
import { routes } from "./routes";

dotenv.config();

const APP_PORT = process.env.APP_PORT;

const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID ?? "";
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "";
const GOOGLE_KEY_FILE = process.env.GOOGLE_KEY_FILE ?? "";

async function start() {
  try {
    const app = express();

    const googleAuth = new google.auth.GoogleAuth({
      keyFile: GOOGLE_KEY_FILE,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const repositories = new Repositories(googleAuth, GOOGLE_SPREADSHEET_ID, GOOGLE_SHEET_NAME);
    const controllers = new Controllers(repositories);

    app.use(
      express.urlencoded({
        extended: true,
      })
    );

    app.use(
      express.json({
        limit: "30kb",
      })
    );

    app.use(morgan("dev"));

    app.use(cors());

    app.use("/api", routes(controllers));

    app.listen(APP_PORT, () => {
      console.log(`http://localhost:${APP_PORT}`);
    });
  } catch (e) {
    console.log("Something went wrong: ", e);
  }
}

start();
