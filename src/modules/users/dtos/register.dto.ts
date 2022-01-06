export default class RegisterDto {
    constructor(first_name: string, last_name: string, email: string, password: string) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
    }
    public first_name: string | undefined;
    public last_name: string | undefined;
    public email: string | undefined;
    public password: string | undefined;
}