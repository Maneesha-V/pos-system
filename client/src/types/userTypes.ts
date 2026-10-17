export type Role = 'admin' | 'staff';
export interface User { 
    id: string; 
    name: string; 
    username: string; 
    role: Role 
}