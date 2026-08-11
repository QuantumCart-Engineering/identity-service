import { RefreshTokenDto } from "../../dtos/auth/refresh-token.dto";

export const validateRefreshTokenRequest = (
    data: RefreshTokenDto
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