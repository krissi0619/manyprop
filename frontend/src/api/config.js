const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '';
};

export const API_BASE_URL = getApiUrl();
export const API_AUTH = `${API_BASE_URL}/api/auth`;
export const API_PROPERTIES = `${API_BASE_URL}/api/properties`;
export const API_USERS = `${API_BASE_URL}/api/users`;
export const API_CONTACTS = `${API_BASE_URL}/api/contacts`;
export const API_NEWS = `${API_BASE_URL}/api/news`;
export const API_OFFERS = `${API_BASE_URL}/api/offers`;

export default API_BASE_URL;
