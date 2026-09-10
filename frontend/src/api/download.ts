import api from './axios';

/**
 * Downloads a protected endpoint through axios so the Authorization header is
 * attached. A plain <a href> opens a new tab with no token and always 401s.
 */
export const downloadFile = async (path: string, filename: string): Promise<void> => {
  const response = await api.get(path, { responseType: 'blob' });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Pulls a readable message out of a failed request. When a download fails the
 * error body arrives as a Blob rather than parsed JSON, so it needs decoding
 * before the usual `message` field is reachable.
 */
export const readApiError = async (error: any, fallback: string): Promise<string> => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message ?? fallback;
    } catch {
      return fallback;
    }
  }

  return data?.message ?? fallback;
};
