const express = require("express");
const {
  processPayment,
  sendstripeApi,
} = require("../controllers/payment.Controller");
const {
  isAuthenticatedUser,
  isAuthorizeRoles,
} = require("../middleware/authenticate");
const router = express.Router();

router.route("/payment/process").post(isAuthenticatedUser, processPayment);
router.route("/stripeAPi").get(isAuthenticatedUser, sendstripeApi);

module.exports = router;
