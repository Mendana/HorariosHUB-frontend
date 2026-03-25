export type UserRole = 'user' | 'professor' | 'admin';

export interface User {
  email: string;
  role: UserRole;
}
