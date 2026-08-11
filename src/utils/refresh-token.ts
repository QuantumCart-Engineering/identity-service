import { randomBytes, createHash } from "crypto";

export const generateRefreshToken = (): string => {
    return randomBytes(64).toString("hex");
};

export const hashRefreshToken = (
    token: string
): string => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};