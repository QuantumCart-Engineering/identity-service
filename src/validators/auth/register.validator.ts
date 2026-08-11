import { RegisterDto } from "../../dtos/auth/register.dto";

export const validateRegisterRequest = (
    data: RegisterDto
): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!data.email?.trim()) {
        errors.push("Email is required");
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(data.email.trim())) {
            errors.push("Invalid email format");
        }
    }

    if (!data.phone?.trim()) {
        errors.push("Phone is required");
    } else if (!/^\d{10}$/.test(data.phone.trim())) {
        errors.push("Phone must contain exactly 10 digits");
    }

    if (!data.password) {
        errors.push("Password is required");
    } else if (data.password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!data.firstName?.trim()) {
        errors.push("First name is required");
    }

    if (!data.lastName?.trim()) {
        errors.push("Last name is required");
    }

    return errors;
};