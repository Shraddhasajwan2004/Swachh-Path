// Base URL for API calls. 
// In development with full-stack setup, it's the same origin.
// For production, this should be the URL of the backend deployed on Render.
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || window.location.origin;
