// src/utils/auth.ts
type User = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: string;
  status: string;
  token: string;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const isAuthorized = (): boolean => {
  const user = getCurrentUser();
  return !!user && (user.isAdmin || user.role === "TL" || user.role === "TM");
};
