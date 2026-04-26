const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "Request failed");
  }
  
  return response.json();
}

export const api = {
  createProfile: (data: any) => fetchWithAuth("/profile", { method: "POST", body: JSON.stringify(data) }),
  getProfile: (userId: string) => fetchWithAuth(`/profile/${userId}`),
  getProfileByEmail: (email: string) => fetchWithAuth(`/profile/email/${email}`),
  checkNovelty: (query: string) => fetchWithAuth(`/researchers/novelty?q=${query}`),
  runExperiment: (data: { hypothesis: string; domain: string; user_id: string }) => 
    fetchWithAuth("/run", { method: "POST", body: JSON.stringify(data) }),
  getPlans: (userId: string) => fetchWithAuth(`/plans?user_id=${userId}`),
  searchLiterature: (query: string) => fetchWithAuth(`/literature/search?q=${query}`),
  getSimilarResearchers: (planId: string, userId: string) => 
    fetchWithAuth(`/researchers/similar?plan_id=${planId}&user_id=${userId}`),
  getNotifications: (userId: string) => fetchWithAuth(`/notifications/${userId}`),
  markNotificationRead: (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: "PATCH" }),
  sendCollabRequest: (data: any) => fetchWithAuth("/collab/request", { method: "POST", body: JSON.stringify(data) }),
  submitFeedback: (data: any) => fetchWithAuth("/feedback", { method: "POST", body: JSON.stringify(data) }),
};
