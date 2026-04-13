import config from '../config'
import { getToken } from '../utils/auth'

const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const loginUser = async (credentials) => {
  const response = await fetch(`${config.apiUrl}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  })
  return handleResponse(response)
}

export const signupUser = async (userData) => {
  const response = await fetch(`${config.apiUrl}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  })
  return handleResponse(response)
}
