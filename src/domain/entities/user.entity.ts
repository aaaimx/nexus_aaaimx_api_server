export interface User {
  id: string;
  email: string;
  password?: string; // null if using only social login
  firstName?: string;
  lastName?: string;
  bio?: string;
  photoUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  allowNotifications: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  roleId?: string;
  divisions?: string[];
  clubs?: string[];
}
