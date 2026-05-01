import { request } from '../utils/apiClient';


export const getActiveDetails = async () => {
  return request('/add-details/organization');
};


export const saveBasicDetails = async (payload) => {
  return request('/add-details/organization', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const saveBankDetails = async (payload) => {
  return request('/add-details/bank-details', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const saveIsoCertificates = async (payload) => {
  return request('/add-details/iso-certificates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const getBankDetails = async () => {
  return request('/add-details/bank');
};


export const getIsoCertificates = async () => {
  return request('/add-details/iso');
};
