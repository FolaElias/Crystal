export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  totpCode?: string;
}
