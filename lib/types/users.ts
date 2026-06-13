export type UserRole = 'student' | 'profesor' | 'admin';

export interface User {
  email: string;
  role: UserRole;
}
