import express from "express";
import {
  getUsersList,
  getUserById,
  updateUserProfile,
  promoteAdmin,
  promoteSeller,
  demoteSeller,
  deleteUser,
  getNewCustomersThisMonth,
} from "../controllers/userControllers";
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../controllers/addressController";
import { auth, admin } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, admin, getUsersList);
router.get("/new-customers", auth, admin, getNewCustomersThisMonth);
router.post("/promote/admin/:id", auth, admin, promoteAdmin);
router.post("/promote/seller/:id", auth, admin, promoteSeller);
router.post("/demote/seller/:id", auth, admin, demoteSeller);

router
  .route("/:id")
  .get(auth, getUserById)
  .put(auth, updateUserProfile)
  .delete(auth, admin, deleteUser);

router
  .route("/:userId/addresses")
  .get(auth, getUserAddresses)
  .post(auth, addUserAddress);

router
  .route("/:userId/addresses/:addressId")
  .put(auth, updateUserAddress)
  .delete(auth, deleteUserAddress);

export default router;
