export interface User {
    username: string;
    email: string;
    password: string;
    is_admin?: boolean;
}


export interface IUserService {
    getAllUsers(): Promise<User[]>;
    login_user(username: string, password: string): Promise<boolean>;
    logout_user(username: string): Promise<boolean>;
}