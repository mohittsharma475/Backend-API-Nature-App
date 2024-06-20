const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const catchAsync = require("../utils/catchError");

// catchAsync
const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //user.save
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

module.exports = signup;
