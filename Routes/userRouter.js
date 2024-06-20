const express = require("express");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require("../controllers/userController");
const signup  = require("../controllers/authController");

const userRouter = express.Router();

userRouter.post("/signup", signup);

userRouter.route("/").get(getAllUsers).post(createUser);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
