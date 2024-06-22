const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const tourRouter = require("./Routes/tourRouter");
const userRouter = require("./Routes/userRouter");
const AppError = require("./utils/appError");

const app = express();

//1. GLobal middlemare

//set security http header
app.use(helmet());

//dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//limit requests from same API
const limiter = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000, //1hr= 60m *60s*1000ms
  message: "Too many requests from this IP, please try again in an hour!",
});

if (process.env.NODE_ENV === "production") {
  app.use("/api", limiter);
}

//body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// data sanitization against NOSQL query injection
app.use(mongoSanitize());
-(
  //filter out $sign from body or params
  // data sanitization XSS
  app.use(xss())
);
-(
  // clean any user input from malicius html code

  app.use(
    hpp({
      whitelist: [
        "duration",
        "ratingsQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price",
      ],
    })
  )
);

//serving static files
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
