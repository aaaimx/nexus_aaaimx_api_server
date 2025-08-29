export default class AppException extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public description?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppException";
  }
}
