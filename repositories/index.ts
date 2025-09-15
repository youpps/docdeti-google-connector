import { Auth } from "googleapis";
import { GoogleRepository } from "./googleRepository";

class Repositories {
  readonly googleRepository: GoogleRepository;

  constructor(auth: Auth.GoogleAuth, spreadsheetId: string, sheetName: string,) {
    this.googleRepository = new GoogleRepository(auth, spreadsheetId, sheetName);
  }
}

export { Repositories };
