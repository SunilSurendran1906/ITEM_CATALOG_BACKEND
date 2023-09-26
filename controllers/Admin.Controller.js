// Admin: Get all Users

const catchAsyncError = require("../middleware/catch.AsyncError");
const UserModel = require("../modules/user.Model");
const ErrorHandler = require("../utils/error.Handler");

// get all users GET :{{BASE_URL}}/api/auth/admin/users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await UserModel.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// GET particalarUser:{{BASE_URL}}/api/auth/admin/user/:id
exports.getParticularUser = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found with this ${req.params.id}`));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// Admin:Update user role PUT : {{BASE_URL}}/api/auth/admin/:id

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    user,
  });
});

// Admin : Delete User :{{BASE_URL}}/api/auth/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findOneAndDelete({ _id: req.params.id });
  if (!user) {
    return next(new ErrorHandler(`User not found with this ${req.params.id}`));
  }
  res.status(200).json({
    success: true,
    message: "Successfully deleted the User",
  });
});
