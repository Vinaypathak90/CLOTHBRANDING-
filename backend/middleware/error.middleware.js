/**
 * Global centralized error management matrix for preeti_clothing
 */
const errorHandler = (err, req, res, next) => {
  // Establish default status code constraints
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorMessage = err.message || 'An internal system structure exception has occurred.';

  // Handle specific Supabase / PostgreSQL error codes explicitly
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation (e.g., duplicate slug or registration email)
        statusCode = 400;
        errorMessage = 'Data conflict: A resource with these matching criteria already exists.';
        break;
      case '23503': // Foreign key violation (e.g., deleting a category containing active products)
        statusCode = 400;
        errorMessage = 'Operational failure: Relational structural dependencies restrict this modification.';
        break;
      case 'PGRST116': // Supabase .single() query returned 0 rows
        statusCode = 404;
        errorMessage = 'Requested document or item context could not be located.';
        break;
      default:
        // Keep status code as 500 or incoming for unhandled db codes
        break;
    }
  }

  // Log detailed structural stack to server instance logs console for engineering diagnostic evaluation
  console.error(`\n[SERVER ERROR ALERT]-------------------------------------`);
  console.error(`Path: ${req.method} ${req.originalUrl}`);
  console.error(`Message: ${err.message}`);
  if (err.stack) {
    console.error(`Stack trace:\n${err.stack}`);
  }
  console.error(`---------------------------------------------------------\n`);

  // Deliver sanitized operational data payload to client interface
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
    // Hide deep framework file tracking traces entirely during live production environments
    stack: process.env.NODE_ENV === 'production' ? '🔒 Protected Matrix' : err.stack
  });
};

module.exports = { errorHandler };
