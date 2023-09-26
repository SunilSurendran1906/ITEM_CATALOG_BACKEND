const express = require("express");
const {
  isAuthenticatedUser,
  isAuthorizeRoles,
} = require("../middleware/authenticate");
const router = express.Router();
const {
  newOrder,
  getSingleOrder,
  myOrder,
  orders,
  updateOrder,
  deleteOrder,
} = require("../controllers/order.Controller");

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/myorders").get(isAuthenticatedUser, myOrder);

// Admin Routes
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, isAuthorizeRoles("admin"), orders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, isAuthorizeRoles("admin"), updateOrder);
router
  .route("/admin/order/:id")
  .delete(isAuthenticatedUser, isAuthorizeRoles("admin"), deleteOrder);
module.exports = router;
