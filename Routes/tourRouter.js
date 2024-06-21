const express = require("express");
const {
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  getTour,
} = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");

const tourRouter = express.Router();

tourRouter
  .route("/")
  .get(protect, restrictTo("admin",'lead-guide'), getAllTours)
  .post(createTour);

tourRouter
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = tourRouter;
