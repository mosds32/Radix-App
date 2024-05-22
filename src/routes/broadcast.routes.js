import {Router}  from 'express';
import { getBroadCast } from '../controllers/broadcast.controllers.js';
const router = Router();


router.route('/get-broadcast/:type').get(getBroadCast);





export default router;