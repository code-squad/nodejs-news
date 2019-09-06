import { Response } from 'express';
import JWT from 'jsonwebtoken';
import { User } from '../entity/user.entity';
import { JWT_SECRET } from './secrets';

export function issueToken(res: Response, user: User) {
   const token = JWT.sign({
    id: user.id,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    privilege: user.privilege,
  }, JWT_SECRET, {
    expiresIn: '24h',
  });
  res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
}

export function removeToken(res: Response) {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 });
}
