export class AjaxError extends Error {
  status: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.status = statusCode;
  }
}

export const ajax = async <T>(url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new AjaxError(response.status, response.statusText);
  }

  const data = (await response.json()) as T;
  return data;
};
