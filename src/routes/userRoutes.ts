import express from 'express';
import {
  login,
  register,
  getUsersList,
  getUserBydId,
  deleteUser,
  updateUserProfile,
  promoteAdmin,
  googleLogin,
} from '../controllers/userControllers';
import { admin, auth } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getUsersList);
router.route('/promote/:id').post(auth, admin, promoteAdmin);
router
  .route('/:id')
  .get(getUserBydId)
  .delete(auth, admin, deleteUser)
  .put(auth, updateUserProfile);
router.route('/register').post(register);
router.route('/google-login').post(googleLogin);
router.route('/login').post(login);

export default router;
