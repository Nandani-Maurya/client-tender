const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getActiveOrganization = async () => {
  try {
    const response = await fetch(`${API_URL}/organizations/active`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active organization:', error);
    return { success: false, data: null };
  }
};

export const saveOrganization = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving organization:', error);
    return { success: false, message: 'Server connection error while saving organization details' };
  }
};
