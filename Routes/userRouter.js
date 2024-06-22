const express = require("express");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");
const { login, signup, restrictTo, protect, forgotPassword, resetPassword, updatePassword } = require("../controllers/authController");

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/updateMe",protect, updateMe);
userRouter.delete("/deleteMe",protect, deleteMe);
userRouter.patch("/updatePassword", updatePassword);
userRouter.patch("/resetPassword/:token", resetPassword);

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
