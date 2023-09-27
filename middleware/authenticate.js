const ErrorHandler = require("../utils/error.Handler");
const UserModel = require("../modules/user.Model");
const catchAsyncError = require("./catch.AsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookie;
  if (!token) {
    return next(new ErrorHandler("Login first to handle this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await UserModel.findById(decoded.id);
  next();
});

exports.isAuthorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role ${req.user.role} is not allowed`, 401)
      );
    }
    next();
  };
};
