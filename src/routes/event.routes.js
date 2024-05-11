import {Router} from 'express';
import { getCategoryEvent , getEvents, UserEvents, getUserEvents} from '../controllers/eventcategory.controllers.js';
const router = Router();
import authentication from '../middlewares/auth.middlewares.js';
router.route('/category/:title').get(getCategoryEvent);

router.route('/get-event').get(getEvents);

router.route('/user-event').post(authentication, UserEvents);

router.route('/get-user-event').get(authentication,getUserEvents);
export default router;