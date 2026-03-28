export const COOKIE_NAME = 'wkdi_admin_session';
const TOKEN_VALUE = 'wkdi-admin-authenticated';

export function validateAdminCredentials(user: string, password: string): boolean {
  const users = [
    { user: process.env.ADMIN_USER, password: process.env.ADMIN_PASSWORD },
    { user: process.env.ADMIN_USER_2, password: process.env.ADMIN_PASSWORD_2 },
  ];
  return users.some(
    (u) => u.user && u.password && user === u.user && password === u.password
  );
}

export function makeSessionCookie(): string {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  return `${COOKIE_NAME}=${TOKEN_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function isValidSession(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${COOKIE_NAME}=${TOKEN_VALUE}`);
}
