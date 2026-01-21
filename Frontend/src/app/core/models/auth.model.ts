export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: 'Buyer' | 'Vendor' | 'Transporter' | 'Admin';
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

export interface OtpRequest {
  phoneNumber: string;
}

export interface OtpVerification {
  phoneNumber: string;
  otp: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  fullName: string;
  role: string;
  email?: string;
  companyName?: string;
  gstNumber?: string;
  address?: string;
}
