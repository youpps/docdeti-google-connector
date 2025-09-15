import { Router } from "express";
import { Controllers } from "../controllers";
import { Repositories } from "../repositories";

function routes(controllers: Controllers) {
  const router = Router();

  router.post("/feedback", controllers.feedbackController.handle);

  return router;
}

export { routes };
