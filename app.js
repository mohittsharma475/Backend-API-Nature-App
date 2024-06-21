const express = require("express");
const cookieParser = require("cookie-parser")
const tourRouter = require("./Routes/tourRouter");
const userRouter = require("./Routes/userRouter");
const AppError = require("./utils/appError");

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //     status:'fail',
  //     message:`Can't find ${req.originalUrl}on this server!`
  // })

  // const error = new Error(`Can't find ${req.originalUrl}on this server!`);
  // error.status = 'fail';
  // error.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl}on this server!`, 404));
});

// can be moved to errController
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    // operational,trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // programming or other unknown error
      console.error("Error", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
});

module.exports = app;
