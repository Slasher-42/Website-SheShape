export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const notFoundError = (message) => new HttpError(404, message)
export const badRequestError = (message) => new HttpError(400, message)
