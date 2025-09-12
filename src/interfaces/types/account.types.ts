export interface GetAccountInput {
  userId: string;
}

export interface GetAccountOutput {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  bio?: string | undefined;
  photoUrl?: string | undefined;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | undefined;
  allowNotifications: boolean;
  roleId?: string | undefined;
  divisions?: string[] | undefined;
  clubs?: string[] | undefined;
}

export interface UpdateAccountInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface UpdateAccountOutput {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  bio?: string | undefined;
  photoUrl?: string | undefined;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | undefined;
  allowNotifications: boolean;
  roleId?: string | undefined;
  divisions?: string[] | undefined;
  clubs?: string[] | undefined;
}
