import { Request, Response } from "express";
import Joi from "joi";
import { Repositories } from "../repositories";
import { Status } from "../types/status";
import { VisitFeedbackType } from "../types/visit";
import { VisitDialogMessageSender } from "../types/visitDialogMessage";

class FeedbackController {
  constructor(private repositories: Repositories) {}

  handle = async (req: Request, res: Response) => {
    try {
      const dialogSchema = Joi.object({
        text: Joi.string().min(1).required(),
        sender: Joi.valid(VisitDialogMessageSender.Bot, VisitDialogMessageSender.User).required(),
      });

      const bodySchema = Joi.object({
        type: Joi.valid(VisitFeedbackType.Positive).required(),
        summary: Joi.string().min(1).required(),
        dialog: Joi.array().min(1).items(dialogSchema),
        patient: Joi.string().min(1).required(),
        phone: Joi.string().min(1).required(),
        date: Joi.date().required(),
        processedAt: Joi.date().required(),
        doctor: Joi.string().min(1).required(),
        address: Joi.string().min(1).required(),
      });

      const { error: bodyError, value: body } = bodySchema.validate(req.body);

      if (bodyError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: bodyError?.message },
        });
      }

      const isSent = await this.repositories.googleRepository.saveFeedback(body);

      if (!isSent) {
        return res.status(500).json({
          status: Status.Error,
          data: { message: "Feedback has not been saved to Google Sheets" },
        });
      }

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Feedback has not been saved to Google Sheets" },
      });
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };
}

export { FeedbackController };
