import {Router} from 'express';
import { signup, login, otpVerify , forgetPassword, resendOtp, logout, userAccountDeletion} from '../controllers/auth.controllers.js';
import authentication from '../middlewares/auth.middlewares.js';
const router = Router();
router.route('/signup').post(signup);

router.route('/login').post(login);

router.route('/verify-otp').post(authentication, otpVerify);

router.route('/forget-password').post(forgetPassword);

router.route('/resend-otp').post(resendOtp);

router.route('/logout').get(authentication,logout);

router.route('/delete-user').delete(authentication, userAccountDeletion);

export default router;
