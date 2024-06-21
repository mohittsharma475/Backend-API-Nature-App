const express = require("express");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require("../controllers/userController");
const { login, signup, restrictTo, protect } = require("../controllers/authController");

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter
  .route("/")
  .get(protect, restrictTo("admin"), getAllUsers)
  .post(createUser);

userRouter
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(protect, restrictTo("admin"), deleteUser);

module.exports = userRouter;
