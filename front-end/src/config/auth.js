export function getStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem("user");
}

/** For routes that need X-User-Id until JWT */
export function authHeaders(extra = {}) {
  const user = getStoredUser();
  const headers = { ...extra };
  if (user?.user_id) {
    headers["X-User-Id"] = String(user.user_id);
  }
  return headers;
}