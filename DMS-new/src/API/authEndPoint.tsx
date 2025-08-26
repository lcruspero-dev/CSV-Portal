/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL;

const apiHelper = async (endpoint: string, method: string, body?: object) => {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await axios({
      method: method,
      url: `${baseURL}${endpoint}`,
      headers: headers,
      data: body,
    });

    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const AuthAPI = {
  login: (body: object) => apiHelper("/api/users/login", "POST", body),
  register: (body: object) => apiHelper("/api/users/", "POST", body),
};
