import { API_URL } from "./api";
import { authHeaders, getStoredUser, setStoredUser } from "./auth";

export async function refreshCurrentUser() {
  const current = getStoredUser();
  if (!current?.user_id) return null;

  try {
    const res = await fetch(`${API_URL}/user/me`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok && data.ok && data.user) {
      setStoredUser(data.user);
      return data.user;
    }
  } catch (err) {
    console.log(err);
  }
  return current;
}
