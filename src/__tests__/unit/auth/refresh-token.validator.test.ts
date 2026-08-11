import { validateRefreshTokenRequest } from "../../../validators/auth/refresh-token.validator";

describe("validateRefreshTokenRequest", () => {
    it("should return no errors for a valid refresh token", () => {
        const data = {
            refreshToken: "valid-refresh-token"
        };

        const errors = validateRefreshTokenRequest(data);

        expect(errors).toEqual([]);
    });

    it("should return an error when refresh token is missing", () => {
        const data = {
            refreshToken: ""
        };

        const errors = validateRefreshTokenRequest(data);

        expect(errors).toContain(
            "Refresh token is required"
        );
    });

    it("should return an error when refresh token is undefined", () => {
        const data = {
            refreshToken: undefined
        };

        const errors = validateRefreshTokenRequest(
            data as any
        );

        expect(errors).toContain(
            "Refresh token is required"
        );
    });

    it("should return an error when refresh token is not a string", () => {
        const data = {
            refreshToken: 12345
        };

        const errors = validateRefreshTokenRequest(
            data as any
        );

        expect(errors).toContain(
            "Refresh token is required"
        );
    });
});