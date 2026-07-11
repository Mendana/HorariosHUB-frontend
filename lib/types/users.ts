export type UserRole = 'student' | 'profesor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
