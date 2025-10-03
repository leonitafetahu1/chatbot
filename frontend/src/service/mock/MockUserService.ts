import {config} from "@/config/environment.ts";
import {mock_users} from "@/service/mock/data/users.data.ts";
import delay from "@/utils/delay.ts";
import type {IUserService, User} from "@/service/types/user.types.ts";


const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export class MockUserService implements IUserService {
    private users: User[] = [...mock_users];

    async getAllUsers(): Promise<User[]> {
        return this.users;
    }

    async login_user(username: string, password: string): Promise<boolean> {
        await delay(config.mock_delay_ms);

        try {
            const user = this.users.find(u => u.email === username);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const hashedPassword = await sha256(password);
            const isValid = hashedPassword === user.password;

            if (!isValid) {
                throw new Error('Invalid password');
            }

            localStorage.setItem("user_access_token", "dummy_token");
            localStorage.setItem("is_admin", String(user.is_admin)); // not used

            return true;
        } catch (error) {
            return false;
        }
    }

    async logout_user(username: string): Promise<boolean> {
        await delay(config.mock_delay_ms);
        try{
            console.log(`Logging out... ${username}`);
            // remove login tokens
            localStorage.removeItem("user_access_token");
            localStorage.removeItem("is_admin");

            return true;
        }catch (error) {
            return false;
        }
    }
}