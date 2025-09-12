export interface Club {
  id: string;
  name: string;
  description?: string | undefined;
  logoUrl?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
