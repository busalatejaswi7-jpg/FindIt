export type LoggedInUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "SHOP_OWNER";
};

const TOKEN_KEY = "findit_token";
const USER_KEY = "findit_user";

export const saveAuth = (
  token: string,
  user: LoggedInUser
) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): LoggedInUser | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};