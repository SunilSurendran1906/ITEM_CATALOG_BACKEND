const express = require("express");
const {
  getProducts,
  newProduct,
  getSingleProduct,
  UpdateProduct,
  deleteProduct,
  createReview,
  getReviews,
  deletReview,
  getAdminProducts,
} = require("../controllers/products.Controller");
const router = express.Router();
const {
  isAuthenticatedUser,
  isAuthorizeRoles,
} = require("../middleware/authenticate");
const multer = require("multer");
const path = require("path");

const uploader = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads/product"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
router.route("/products").get(getProducts);

router.route("/product/:id").get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser, createReview);

// Admin routes
router
  .route("/admin/product/new")
  .post(
    isAuthenticatedUser,
    isAuthorizeRoles("admin"),
    uploader.array("images"),
    newProduct
  );

router
  .route("/admin/products")
  .get(isAuthenticatedUser, isAuthorizeRoles("admin"), getAdminProducts);
router
  .route("/admin/product/:id")
  .delete(isAuthenticatedUser, isAuthorizeRoles("admin"), deleteProduct);
router
  .route("/admin/product/:id")
  .put(
    isAuthenticatedUser,
    isAuthorizeRoles("admin"),
    uploader.array("images"),
    UpdateProduct
  );
router
  .route("/admin/reviews")
  .get(isAuthenticatedUser, isAuthorizeRoles("admin"), getReviews);
router
  .route("/admin/review")
  .delete(isAuthenticatedUser, isAuthorizeRoles("admin"), deletReview);

module.exports = router;
