export class UserLoginResponse {
  email: string;
  username: string;
  role: string;
  accessToken: string;

  constructor(
    email: string,
    username: string,
    role: string,
    accessToken: string
  ) {
    this.email = email;
    this.username = username;
    this.role = role;
    this.accessToken = accessToken;
  }
}
