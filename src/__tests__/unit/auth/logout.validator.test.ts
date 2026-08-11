import { validateLogoutRequest } from "../../../validators/auth/logout.validator";

describe("validateLogoutRequest", () => {
    it("should return no errors for a valid refresh token", () => {
        const data = {
            refreshToken: "valid-refresh-token"
        };

        const errors = validateLogoutRequest(data);

        expect(errors).toEqual([]);
    });

    it("should return an error when refresh token is missing", () => {
        const data = {
            refreshToken: ""
        };

        const errors = validateLogoutRequest(data);

        expect(errors).toContain(
            "Refresh token is required"
        );
    });

    it("should return an error when refresh token is undefined", () => {
        const data = {
            refreshToken: undefined
        };

        const errors = validateLogoutRequest(
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

        const errors = validateLogoutRequest(
            data as any
        );

        expect(errors).toContain(
            "Refresh token is required"
        );
    });
});