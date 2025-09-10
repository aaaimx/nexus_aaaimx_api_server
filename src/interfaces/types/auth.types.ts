export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: Date | null;
    emailVerified: boolean;
    roleId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: AuthTokens;
}

export interface RefreshTokenInput {
  refresh_token: string;
}

export interface ValidateAccessInput {
  userId: string;
}

export interface ValidateAccessResult {
  isValid: boolean;
}
