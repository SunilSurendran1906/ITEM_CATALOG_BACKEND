const express = require("express");
const multer = require("multer");
const path = require("path");

const uploader = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads/user"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  changePassword,
  updateProfile,
} = require("../controllers/auth.Controller");
const {
  getAllUsers,
  getParticularUser,
  updateUser,
  deleteUser,
} = require("../controllers/Admin.Controller");
const {
  isAuthenticatedUser,
  isAuthorizeRoles,
} = require("../middleware/authenticate");
const router = express.Router();

router.route("/register").post(uploader.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logOutUser);
router.route("/password/forget").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/myprofile").get(isAuthenticatedUser, getUserProfile);
router.route("/password/change").put(isAuthenticatedUser, changePassword);
router
  .route("/update")
  .put(isAuthenticatedUser, uploader.single("avatar"), updateProfile);

/// Admin routes
router
  .route("/admin/users")
  .get(isAuthenticatedUser, isAuthorizeRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, isAuthorizeRoles("admin"), getParticularUser)
  .put(isAuthenticatedUser, isAuthorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, isAuthorizeRoles("admin"), deleteUser);

module.exports = router;
