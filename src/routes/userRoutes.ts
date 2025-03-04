import express from "express";
import {
  login,
  register,
  getUsersList,
  getUserBydId,
  deleteUser,
  updateUserProfile,
  promoteAdmin,
  googleLogin,
  getNewCustomersThisMonth,
  demoteSeller,
  promoteSeller,
} from "../controllers/userControllers";

import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../controllers/addressController";

import { admin, auth } from "../middleware/auth";

const router = express.Router();

router.route("/").get(getUsersList);
router.get("/new-customers", auth, admin, getNewCustomersThisMonth);
router.route("/promote/admin/:id").post(auth, admin, promoteAdmin);
router.route("/promote/seller/:id").post(auth, admin, promoteSeller);
router.route("/demote/seller/:id").post(auth, admin, demoteSeller);
router.route("/register").post(register);
router.route("/google-login").post(googleLogin);
router.route("/login").post(login);

router
  .route("/:userId/addresses")
  .get(auth, getUserAddresses)
  .post(auth, addUserAddress);

router
  .route("/:userId/addresses/:addressId")
  .put(auth, updateUserAddress)
  .delete(auth, deleteUserAddress);

router
  .route("/:id")
  .get(getUserBydId)
  .delete(auth, admin, deleteUser)
  .put(auth, updateUserProfile);

export default router;
