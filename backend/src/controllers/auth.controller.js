import { User } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const user = await User.create({ name, email, phone, password });

  setAuthCookie(res, signToken(user));
  res.status(201).json({ data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await User.scope('withPassword').findOne({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user || !(await user.checkPassword(password))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }

  setAuthCookie(res, signToken(user));
  res.json({ data: user });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
};

export const me = (req, res) => {
  res.json({ data: req.user });
};
