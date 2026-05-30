export interface UserInterface {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role: string;
  walletBalance: number;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}
