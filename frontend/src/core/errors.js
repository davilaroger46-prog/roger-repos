export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function parseApiError(response) {
  const body = await response.json().catch(() => null);
  const message = body?.detail || `Erro HTTP ${response.status}`;
  return new ApiError(message, response.status);
}
