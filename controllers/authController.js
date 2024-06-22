const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Models/userModel");
const catchAsync = require("../utils/catchError");
const AppError = require("../utils/appError");
const sendPasswordResetEmail = require("../utils/SendResetEmail");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
  ),
  // secure:true, //only send on https encrypted req,
  httpOnly: true, // cookie cannot be accessed or modified by browser
  sameSite: "Strict",
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  //remove paassword from output
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// catchAsync
const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // or user.save
  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");

  // encrypt passed password and compare
  // do it im schema using instance method

  const correct = await user.correctPassword(password, user.password);

  if (!correct || !user) {
    return next(new AppError("Invalid Credentials", 401));
  }

  const token = signToken(user._id);

  /*
  res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Strict'});
  res.json({
    status:"success",
    message:"Login Successful"
  })

  */

  res.status(200).json({
    status: "success",
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  // get token &check
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Your are not logged in! Please login to get access.", 401)
    );
  }
  // valid the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // check ig user changed password after the token generated

  if (freshUser.changedPasswordAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError("user recently changed password! Please login in again", 401)
    );
  }
  //Grant access
  req.user = freshUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles : array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You dont have a permission to perform this action"),
        403
      );
    }

    next();
  };
};
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  const resetLink = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetLink,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);

    return next(
      new AppError(
        "There was an error sending the email. Please try again later.",
        500
      )
    );
  }
});
module.exports = forgotPassword;

const resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user from token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // 2. check if token has not expired or user exists, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired"), 400);
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save({ validateBeforeSave: true });

  //3. update the passwordChangedAt in db for the user

  //4.log the user in , send new JWT

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user from collection

  const user = await user.findById(req.user.id).select("+password");

  //2. check posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  //3. if correct update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: true });
  //why findByIdAndUpdate -  validate not going to work because this.password not defined as mongoose dont keep the doc in memory also pre middleware not going to work

  //4. logged the user in , send JWt

  const token = signToken(user._id);

  res.status(200).json({
    status: "Success",
    token,
  });
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  resetPassword,
  forgotPassword,
  updatePassword,
};
