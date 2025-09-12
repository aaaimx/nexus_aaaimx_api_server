export interface UserRole {
  userId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRole {
  id: string;
  email: string;
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
  role: {
    id: string;
    name: string;
    description: string;
  };
  divisions?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  clubs?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}
