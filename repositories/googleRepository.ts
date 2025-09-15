import { Auth, google } from "googleapis";
import { IVisitDialogMessage } from "../types/visitDialogMessage";
import moment from "moment";

interface ISendFeedback {
  summary: string;
  dialog: Pick<IVisitDialogMessage, "sender" | "text">[];
  patient: string;
  phone: string;
  date: Date;
  processedAt: Date;
  doctor: string;
  address: string;
}

class GoogleRepository {
  private readonly sheets = google.sheets("v4");

  constructor(
    private readonly auth: Auth.GoogleAuth,
    private readonly spreadsheetId: string,
    private readonly sheetName: string
  ) {}

  private formatDialog(dialog: Pick<IVisitDialogMessage, "sender" | "text">[]): string {
    return dialog.map((msg) => `${msg.sender}:\n ${msg.text}`).join("\n\n");
  }

  async saveFeedback(data: ISendFeedback): Promise<boolean> {
    try {
      // Проверяем и добавляем заголовки при необходимости
      await this.ensureHeaders();

      // Добавляем новую строку
      await this.sheets.spreadsheets.values.append({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:A`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              data.summary,
              data.patient,
              data.phone,
              moment(data.date).format("DD.MM.YYYY, HH:mm"),
              moment(data.processedAt).format("DD.MM.YYYY, HH:mm"),
              data.doctor,
              data.address,
              this.formatDialog(data.dialog),
            ],
          ],
        },
      });

      return true;
    } catch (e) {
      console.error("Error sending feedback to Google Sheets:", e);
      return false;
    }
  }

  private async ensureHeaders(): Promise<void> {
    const headers = ["Саммари (AI)", "ФИО", "Телефон", "Дата", "Дата приёма", "Врач", "Адрес клиники", "Полный диалог"];

    const res = await this.sheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A1:Z1`,
    });

    if (!res.data.values || JSON.stringify(res.data.values[0]) !== JSON.stringify(headers)) {
      await this.sheets.spreadsheets.values.update({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }
  }
}

export { GoogleRepository };
