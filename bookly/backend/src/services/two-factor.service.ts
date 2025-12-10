import * as speakeasy from 'speakeasy';
import { authenticator } from 'otplib';

// Generate a new 2FA secret for a user
export const generateTwoFactorSecret = (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Bookly App (${email})`,
    issuer: 'Bookly',
    length: 32, // Standard length for TOTP secret
  });
  
  return secret;
};

// Verify a 2FA token provided by the user
export const verifyTwoFactorToken = (secret: string, token: string) => {
  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow up to 2 intervals before/after
  });
  
  return isValid;
};

// Create QR code URL for 2FA setup
export const generateTwoFactorQR = (secret: string, email: string) => {
  return speakeasy.otpauthURL({
    secret: secret,
    label: `Bookly App (${email})`,
    issuer: 'Bookly',
    encoding: 'base32'
  });
};