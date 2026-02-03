/**
 * Standard API Response class
 * Provides consistent response format across the API
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  // Send response
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data
    });
  }

  // Static factory methods
  static success(res, data = null, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  // Pagination response
  static paginated(res, { data, page, limit, total, totalPages }, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  }
}

module.exports = ApiResponse;
