import {Router} from 'express';
const router = Router();
import { getPodcast } from '../controllers/podcast.controller.js';


router.route('/get-podcast/:type').get(getPodcast);



export default router;