import {Router} from 'express';
import authentication from '../middlewares/auth.middlewares.js';
import { addPost, addLikeComment , getComments, getAllPost, addSavePost, getSavePost, updatePost, DeletePost,DeleteComment, DeleteSavePost
} from '../controllers/chat.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';
const router = Router();
router.use(authentication);
router.route('/add-post').post(upload.array('images'),addPost);

router.route('/add-like-comment').post(addLikeComment);

router.route('/get-comments/:chat_id').get(getComments);

router.route('/get-all-post/:current?/:max?').get(getAllPost);

router.route('/add-save-post/:chatId').post(addSavePost);

router.route('/get-save-post').get(getSavePost);

router.route('/update-post/:fileId').patch(upload.array('images'), updatePost);

router.route('/delete-post/:chat_id').delete(DeletePost);

router.route('/delete-comment/:chatDetailId').delete(DeleteComment);

router.route('/delete-save-post/:chatId').delete(DeleteSavePost);

export default router;