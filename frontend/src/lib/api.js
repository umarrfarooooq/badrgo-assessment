import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const createUser = (data) => api.post("/users", data);
export const getUser = (id) => api.get(`/users/${id}`);

export const createWallet = (data) => api.post("/wallets", data);
export const getWallet = (id) => api.get(`/wallets/${id}`);
export const creditWallet = (id, data) =>
  api.post(`/wallets/${id}/credit`, data);
export const debitWallet = (id, data) => api.post(`/wallets/${id}/debit`, data);
export const getTransactions = (id) => api.get(`/wallets/${id}/transactions`);

export const getDailySummary = (params) =>
  api.get("/reports/daily-summary", { params });

export default api;
