import config from '../config';

const API_URL = `${config.apiUrl}/formats`;

export const getFormats = async () => {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error in getFormats:', error);
        throw error;
    }
};

export const updateFormatMapping = async (id, mappingData) => {
    try {
        const response = await fetch(`${API_URL}/${id}/mapping`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(mappingData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error in updateFormatMapping:', error);
        throw error;
    }
};

export const getFormatById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error in getFormatById:', error);
        throw error;
    }
};
export const updateFormatContent = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error in updateFormatContent:', error);
        throw error;
    }
};

export const deleteFormat = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error in deleteFormat:', error);
        throw error;
    }
};
