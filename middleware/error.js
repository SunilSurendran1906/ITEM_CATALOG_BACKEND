// const ErrorHandler = require("../utils/error.Handler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else if (process.env.NODE_ENV == "production") {
    let message = err.message;
    let error = new Error(message);
    if (err.name == "ValidationError") {
      message = Object.values(err.errors).map((value) => value.message);
      error = new Error(message);
      err.statusCode = 400;
    } else if (err.name == "CastError") {
      message = `Resource not found ${err.path}`;
      error = new Error(message);
      err.statusCode = 401;
    }
    if (err.code === 11000) {
      let message = `duplicate_key ${Object.keys(err.keyValue)} error`;
      error = new Error(message);
      err.statusCode = 400;
    }
    if (err.name === "JSONWebTokenError") {
      let message = `JSON Web Token Is   Invalid.Try again`;
      error = new Error(message);
      err.statusCode = 401;
    }

    if (err.name === "TokenExpireError") {
      let message = `JSON Web Token Is   Expired.Try again`;
      error = new Error(message);
      err.statusCode = 400;
    }

    res.status(err.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
