/**
 * Centralized error handler for Axios requests.
 * 
 * @param {Error} error - The error object from Axios.
 * @returns {string} A user-friendly error message.
 */
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Bad Request';
      case 401:
        return 'Unauthorized. Please check your credentials.';
      case 403:
        return 'Forbidden. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Internal Server Error. Please try again later.';
      default:
        return `Error: ${status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred.';
  }
};

export default handleError;
