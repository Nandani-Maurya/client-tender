const API_URL = import.meta.env.VITE_API_URL || '/api';

export const uploadDocument = async (file, label) => {
  const formData = new FormData();
  formData.append('document', file);
  if (label) {
    formData.append('label', label);
  }

  try {
    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      body: formData,
      // Do not set Content-Type for FormData, browser sets it automatically with boundary
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, message: 'Server connection error during document upload' };
  }
};
