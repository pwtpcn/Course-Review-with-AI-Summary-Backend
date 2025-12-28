export class UserLoginResponse {
    email: string;
    username: string;
    role: string;

    constructor(email: string, username: string, role: string) {
        this.email = email;
        this.username = username;
        this.role = role;
    }
}