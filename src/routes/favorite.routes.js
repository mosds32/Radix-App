import { Router } from "express";
import authentication from "../middlewares/auth.middlewares.js";
import { addFavorite ,getFavorites} from "../controllers/favorite.controllers.js";
const router = Router();

router.route('/add-favorite').post(authentication, addFavorite);

router.route('/get-favorite/:type').get(authentication, getFavorites);

export default router;
