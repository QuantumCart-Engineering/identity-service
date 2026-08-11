import { LoginDto } from "../../dtos/auth/login.dto";

export const validateLoginRequest = (
    data: LoginDto
): string[] => {
    const errors: string[] = [];

    if (!data.email?.trim()) {
        errors.push("Email is required");
    }

    if (!data.password) {
        errors.push("Password is required");
    }

    return errors;
};