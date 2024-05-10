import {Router} from 'express';
const router = Router();
import { getPodcast, getPodcastFavorite } from '../controllers/podcast.controller.js';

import { addFavoritePodcast } from '../controllers/podcast.controller.js';
import authentication from '../middlewares/auth.middlewares.js';

router.route('/get-podcast').get(getPodcast);

router.route('/add-favorite').post(authentication, addFavoritePodcast);

router.route('/get-podcast-favorite').get(authentication, getPodcastFavorite);

export default router;