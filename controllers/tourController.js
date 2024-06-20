const Tour = require("../Models/tourSchema");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchError");

const getAllTours = (req, res) => {};
const updateTour = (req, res) => {};

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError("No tour Found with ID", 404));
  }
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError("No resource found with Id", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

module.exports = {
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  createTour,
};
