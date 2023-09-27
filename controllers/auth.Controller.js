const catchAsyncError = require("../middleware/catch.AsyncError");
const UserModel = require("../modules/user.Model");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/error.Handler");
const sendToken = require("../utils/jwt");
const crypto = require("crypto");


// Register user POST:http://localhost:8000/api/auth/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  let avatar;
  let BASE_URL = process.env.BACKEND_URL;
  if (req.file) {
    avatar = `${BASE_URL}/Uploads/user/${req.file.originalname}`;
  }
  const user = await UserModel.create({
    name,
    email,
    password,
    avatar,
  });
  const token = user.getJwtToken();
  sendToken(user, 201, res);
});


//login user POST:http://localhost:8000/api/auth/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }
  // find the user data in database
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invaild email or password", 401));
  }
  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("Invaild email or password", 401));
  }
  sendToken(user, 201, res);
});

// logOut user GET:http://localhost:8000/api//auth/logout

exports.logOutUser = (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "logged Out successfully..!",
    });
};

// fortgetPasswordSentEmail POST:http://localhost:8000/api/auth/password/forget

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });

  let BASE_URL = process.env.FRONTEND_URL;
  // Create reset Url
  const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;
  const message = `Your password reset url is as follows \n\n
  ${resetUrl} \n\n If you have not requested this email,then ignore this`;
  try {
    sendEmail({
      email: user.email,
      subject: "V-mart Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

//resetPassword API  POST:http://localhost:8000/api/auth/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const token = req.params.token.toString().trim();

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is expired Or Invaild", 401)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not Matched", 401));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 201, res);
});

// Get user Profile GET: http://localhost:8000/api/auth/myprofile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);
  res.status(201).json({
    success: true,
    user,
  });
});

// change password PUT:http://localhost:8000/api/auth/password/change

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select("+password");

  // check password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Old Password is Incorrect"));
  }
  // assinging new password
  user.password = req.body.password;
  await user.save();
  res.status(201).json({
    success: true,
    message: "The password is changed successfully",
  });
});

// update the profile  PUT:http://localhost:8000/api/auth/update

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  let newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  let avatar;
  let BASE_URL = process.env.BACKEND_URL;
  if (req.file) {
    avatar = `${BASE_URL}/Uploads/user/${req.file.originalname}`;
    newUserData = { ...newUserData, avatar };
  }

  const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    user,
  });
});
