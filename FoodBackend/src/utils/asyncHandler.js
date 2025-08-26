import { ApiResponse } from './ApiResponse.js';

const asyncHandler = (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('AsyncHandler caught error:', error);
      console.error('Error stack:', error.stack);
      console.error('Request body:', req.body);
      console.error('Request file:', req.file);
      
      const status = error.statusCode || 500;
      const message = error.message || "Internal Server Error";
      const errors = error.errors || [];
      
      res.status(status).json(new ApiResponse(status, null, message, false, errors));
    }
  };
  
  export { asyncHandler };
  

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }