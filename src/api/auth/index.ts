import {default as verifyOtp} from './verifyOtp';
import {default as logout} from './logout';
import {default as registerDevice} from './registerDevice';
import {default as login} from './login';
import {default as resendOtp} from './resendOtp';

const auth = {
  login,
  verifyOtp,
  resendOtp,
  registerDevice,
  logout,
};

export default auth;
