import {Router} from 'express';
import { getEvents, UserEvents, getUserEvents} from '../controllers/eventcategory.controllers.js';
const router = Router();
import authentication from '../middlewares/auth.middlewares.js';

router.route('/get-event/:type').get(getEvents);

router.route('/user-event').post(authentication, UserEvents);

router.route('/get-user-event').get(authentication,getUserEvents);

export default router;