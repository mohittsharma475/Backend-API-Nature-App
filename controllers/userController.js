const User = require("../Models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchError");

const getAllUsers = (req, res) => {
  res.send("Hello from getALL USERS");
};

const getUser = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

const createUser = (req, res) => {
  res.status(201).json({
    status: "success",
    data: {
      user: "Mohit",
    },
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) newObj[ele] = obj[ele];
  });

  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  // only if already logged in through protect middleware

  // 1. create error is user post password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password Updates. Please use /updatePassword",
        400
      )
    );
  }

  //2. if not update the user doc
  // x because anybody can set his role to admin

  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // not dealing with password
  // user.name = req.body.name;
  // user.email = req.body.email;
  // user.save({validateBeforeSave:false});

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id, {
    active: false,
  });

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
};
