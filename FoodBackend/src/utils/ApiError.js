class ApiError extends Error {
  constructor(message = "Something went wrong", statusCode, errors = [], stack = null) {
    super(message || "Something went wrong");

    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack; // Use custom stack trace if provided
    } else {
      Error.captureStackTrace(this, this.constructor); // Automatically capture stack trace
    }
  }
}

export { ApiError };
