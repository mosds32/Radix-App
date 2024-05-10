import {Router}  from 'express';
import { getBroadCastCategory, getBroadCast, favoriteBroadCast } from '../controllers/broadcast.controllers.js';
const router = Router();
import authentication from '../middlewares/auth.middlewares.js';
router.route('/get-broadcast-category/:type').get(getBroadCastCategory);

router.route('/get-broadcast').get(getBroadCast);

router.route('/add-favorite-broadcast').post(authentication, favoriteBroadCast);



export default router;