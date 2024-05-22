import { recently, getRecentPlayed } from "../controllers/recently.controllers.js";
import authentication from "../middlewares/auth.middlewares.js";
import {Router} from 'express';
const router = Router();
router.route('/add-recent').post(authentication, recently);

router.route('/get-recent').get(authentication, getRecentPlayed);



export default router;