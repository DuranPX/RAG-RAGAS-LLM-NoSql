import axios from 'axios';
import applyInterceptors from './axiosInterceptor';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Apply interceptors
applyInterceptors(api);

/**
 * Perform a GET request.
 * 
 * @param {string} url - The URL to request.
 * @param {object} [params] - Optional query parameters.
 * @returns {Promise<any>} The response data.
 */
export const get = async (url, params) => {
  const response = await api.get(url, { params });
  return response.data;
};

/**
 * Perform a POST request.
 * 
 * @param {string} url - The URL to request.
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<any>} The response data.
 */
export const post = async (url, data) => {
  const response = await api.post(url, data);
  return response.data;
};

/**
 * Perform a PUT request.
 * 
 * @param {string} url - The URL to request.
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<any>} The response data.
 */
export const put = async (url, data) => {
  const response = await api.put(url, data);
  return response.data;
};

/**
 * Perform a PATCH request.
 * 
 * @param {string} url - The URL to request.
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<any>} The response data.
 */
export const patch = async (url, data) => {
  const response = await api.patch(url, data);
  return response.data;
};

/**
 * Perform a DELETE request.
 * 
 * @param {string} url - The URL to request.
 * @returns {Promise<any>} The response data.
 */
export const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

export default api;
