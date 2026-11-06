
export class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errors = [],
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

// Centralized error response
export function handleApiError(error) {
  console.error("API Error:", error);

  // Our custom application errors
  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        message: error.message,
        errors: error.errors,
      },
      { status: error.statusCode }
    );
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(
      (item) => item.message
    );

    return Response.json(
      {
        success: false,
        message: "Validation failed.",
        errors,
      },
      { status: 400 }
    );
  }

  // Invalid MongoDB ObjectId
  if (error.name === "CastError") {
    return Response.json(
      {
        success: false,
        message: "Invalid resource identifier.",
      },
      { status: 400 }
    );
  }

  // Duplicate MongoDB unique field
  if (error.code === 11000) {
    return Response.json(
      {
        success: false,
        message: "This record already exists.",
      },
      { status: 409 }
    );
  }

  // Unexpected server errors
  return Response.json(
    {
      success: false,
      message: "Internal server error. Please try again later.",
    },
    { status: 500 }
  );
}

// Async error wrapper for Next.js API route handlers
export function asyncHandler(handler) {
  return async function (request, context) {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
