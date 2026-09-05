export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
