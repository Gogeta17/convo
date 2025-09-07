import { axiosInstance } from "./axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

// ---------------- AUTH ----------------
export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// ---------------- FRIENDS ----------------
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  try {
    const response = await axiosInstance.post("/users/friend-request", {
      recipientId: userId, // 👈 must match backend controller
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      `Failed to send friend request (HTTP ${error.response?.status || "?"})`;
    throw new Error(message);
  }
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

// ---------------- CHAT ----------------
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  
  if (!response.data?.token) {
    throw new Error("No Stream token received from backend");
  }

  return response.data; // { token: "..." }
}

