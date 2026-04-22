import alerts from './alerts';
import { logout } from './auth';

let isRedirecting = false;

export const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (response.status === 401) {
    const { code, message } = data;
    console.log('401 Error detected:', code, message);

    if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'NO_TOKEN') {
      console.log('Token error matched, preparing alert...');
      if (isRedirecting) {
        throw new Error('Authentication required');
      }

      isRedirecting = true;


      logout();


      await alerts.info(
        code === 'TOKEN_EXPIRED' ? 'Session Expired' : 'Authentication Error',
        message || 'Please log in again.'
      );


      window.location.href = '/login';


      throw new Error(message || 'Authentication required');
    }
  }

  if (!response.ok) {
    return data;
    // throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
