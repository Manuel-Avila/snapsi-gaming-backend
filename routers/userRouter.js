import { Router } from "express";
import * as UserController from "../controllers/userController.js";
import {
  userIdParamSchema,
  usernameParamSchema,
} from "../validators/userValidator.js";
import verifyToken from "../middlewares/verifyToken.js";
import validate from "../middlewares/validateReq.js";

const router = Router();

router.get(
  "/:username",
  verifyToken,
  validate(usernameParamSchema, "params"),
  UserController.getProfile
);


export default router;
