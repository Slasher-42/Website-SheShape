import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'sheshape_token';

const EXPIRES_DAYS = Number(process.env.JWT_EXPIRES_DAYS ?? 7);

const baseCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: `${EXPIRES_DAYS}d`,
  });

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });

export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookieOptions());
