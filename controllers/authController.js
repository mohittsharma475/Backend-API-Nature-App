const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../Models/userModel");
const catchAsync = require("../utils/catchError");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// catchAsync
const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //user.save
  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: newUser,
    },
  });
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
    req.headers.athorization &&
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

const restrictTo =(...roles)=>{
  return (req,res,next)=>{
    // roles : array
    if(!roles.includes(req.user.role)){
      return next(new AppError('You dont have a permission to perform this action'),403);
    }

    next();
  }

}

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
};
