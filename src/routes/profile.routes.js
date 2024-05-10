import {Router}  from 'express';
const router = Router();
import { addProfile, getProfile, EditProfile } from '../controllers/profile.controllers.js';
import authentication from '../middlewares/auth.middlewares.js';
router.use(authentication);
import { upload } from '../middlewares/multer.middlewares.js';
router.route('/add-profile').post(upload.single('img'),addProfile);

router.route('/get-profile').get(getProfile);

router.route('/edit-profile').put(upload.single('img'),EditProfile);


export default router;