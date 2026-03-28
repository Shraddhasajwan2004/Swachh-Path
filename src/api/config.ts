// frontend/src/api/config.ts
const apiUrl = (import.meta as any).env?.VITE_API_URL || window.location.origin;
console.log("API_BASE_URL is set to:", apiUrl); // Add this line
export const API_BASE_URL = apiUrl;