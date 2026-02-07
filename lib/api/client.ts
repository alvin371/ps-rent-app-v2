export type ApiError = {
  error?: string;
  issues?: unknown;
};

export const apiFetch = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = (await response.json()) as ApiError;
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
