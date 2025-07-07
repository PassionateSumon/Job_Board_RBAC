export class ApiError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = "ApiError";
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}
