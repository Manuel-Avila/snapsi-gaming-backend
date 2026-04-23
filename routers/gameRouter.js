import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import * as GameController from "../controllers/gameController.js";

const router = Router();

router.get("/search", verifyToken, GameController.searchGames);
router.get("/categories", verifyToken, GameController.getCategories);
router.post("/reviews", verifyToken, GameController.createReview);
router.get("/reviews/user/:username", verifyToken, GameController.getUserReviews);

export default router;
