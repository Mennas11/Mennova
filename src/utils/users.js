// Temporary "database" until the MERN backend exists.
// NOTE: passwords are stored as plain text here. The backend will hash them (bcrypt) and use JWT.
const KEY = "mennovaUsers";

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function findUser(email) {
  return getUsers().find((u) => u.email === email.trim().toLowerCase());
}

export function createUser({ name, email, password }) {
  const users = getUsers();
  users.push({ name: name.trim(), email: email.trim().toLowerCase(), password });
  localStorage.setItem(KEY, JSON.stringify(users));
}