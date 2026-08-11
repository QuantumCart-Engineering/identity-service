export const getRefreshTokenExpiry = (): Date => {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
        throw new Error(
            "Invalid REFRESH_TOKEN_EXPIRES_IN format"
        );
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    const milliseconds = value * multipliers[unit];

    return new Date(Date.now() + milliseconds);
};