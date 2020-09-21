const { StatusCodes, ReasonPhrases } = require("http-status-codes");

class ApiErrorResponse {
  constructor(response, statusCode) {
    this.MESSAGES = {
      [StatusCodes.BAD_REQUEST]: ReasonPhrases.BAD_REQUEST,
      [StatusCodes.NOT_FOUND]: ReasonPhrases.NOT_FOUND,
    };
    this.statusCode = statusCode;
    this.response = response;
  }

  sendErrorResponse() {
    this.response.status(this.statusCode);
    this.response.send({
      error: this.getErrorMessageByStatusCode(this.statusCode),
    });
  }

  getErrorMessageByStatusCode(statusCode) {
    return this.MESSAGES[statusCode];
  }
}

module.exports = ApiErrorResponse;
