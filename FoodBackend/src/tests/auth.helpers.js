import jwt from 'jsonwebtoken';
import { Seller } from '../models/sellerModel.js';
import { User } from '../models/userModel.js';
import { Admin } from '../models/adminModel.js';

export const createUserWithToken = async (role = 'user') => {
  const roleNum = role === 'admin' ? 1 : role === 'seller' ? 2 : 0;
  let doc;
  if (role === 'admin') {
    doc = await Admin.create({ name: 'Admin', email: `admin+${Date.now()}@test.com`, password: 'P@ssw0rd!', role: 1, is_verified: true });
  } else if (role === 'seller') {
    doc = await Seller.create({ name: 'Seller', email: `seller+${Date.now()}@test.com`, password: 'P@ssw0rd!', role: 2, is_verified: true });
  } else {
    doc = await User.create({ name: 'User', email: `user+${Date.now()}@test.com`, password: 'P@ssw0rd!', role: 0, is_verified: true });
  }
  const token = jwt.sign({ _id: doc._id, role: roleNum }, process.env.ACCESS_TOKEN_SECRET || 'test_access_secret', { expiresIn: '1h' });
  return { doc, token };
};


