import { validateLoginRequest } from "../../../validators/auth/login.validator";

describe("validateLoginRequest", () => {
    it("should return no errors for valid login data", () => {
        const data = {
            email: "test@example.com",
            password: "Password@123"
        };

        const errors = validateLoginRequest(data);

        expect(errors).toEqual([]);
    });

    it("should return an error when email is missing", () => {
        const data = {
            email: "",
            password: "Password@123"
        };

        const errors = validateLoginRequest(data);

        expect(errors).toContain("Email is required");
    });

    it("should return an error when email contains only spaces", () => {
        const data = {
            email: "   ",
            password: "Password@123"
        };

        const errors = validateLoginRequest(data);

        expect(errors).toContain("Email is required");
    });

    it("should return an error when password is missing", () => {
        const data = {
            email: "test@example.com",
            password: ""
        };

        const errors = validateLoginRequest(data);

        expect(errors).toContain("Password is required");
    });

    it("should return errors when both email and password are missing", () => {
        const data = {
            email: "",
            password: ""
        };

        const errors = validateLoginRequest(data);

        expect(errors).toContain("Email is required");
        expect(errors).toContain("Password is required");
        expect(errors).toHaveLength(2);
    });
});