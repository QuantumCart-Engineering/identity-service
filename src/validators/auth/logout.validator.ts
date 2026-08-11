import { LogoutDto } from "../../dtos/auth/logout.dto";

export const validateLogoutRequest = (
    data: LogoutDto
): string[] => {
    const errors: string[] = [];

    if (
        !data.refreshToken ||
        typeof data.refreshToken !== "string"
    ) {
        errors.push("Refresh token is required");
    }

    return errors;
};