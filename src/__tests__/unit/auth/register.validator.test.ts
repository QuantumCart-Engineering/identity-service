import { validateRegisterRequest } from "../../../validators/auth/register.validator";

describe("validateRegisterRequest", () => {
    it("should return no errors for valid registration data", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toEqual([]);
    });

    it("should return an error when email is missing", () => {
        const data = {
            email: "",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Email is required");
    });

    it("should return an error when email contains only whitespace", () => {
        const data = {
            email: "   ",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Email is required");
    });

    it("should return an error for invalid email", () => {
        const data = {
            email: "invalid-email",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Invalid email format");
    });

    it("should return an error when phone is missing", () => {
        const data = {
            email: "test@example.com",
            phone: "",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Phone is required");
    });

    it("should return an error when phone contains only whitespace", () => {
        const data = {
            email: "test@example.com",
            phone: "   ",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Phone is required");
    });

    it("should return an error for invalid phone", () => {
        const data = {
            email: "test@example.com",
            phone: "12345",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain(
            "Phone must contain exactly 10 digits"
        );
    });

    it("should return an error when password is missing", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Password is required");
    });

    it("should return an error for short password", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "123",
            firstName: "Test",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain(
            "Password must be at least 8 characters long"
        );
    });

    it("should return an error when first name is missing", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("First name is required");
    });

    it("should return an error when first name contains only whitespace", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "   ",
            lastName: "User"
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("First name is required");
    });

    it("should return an error when last name is missing", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: ""
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Last name is required");
    });

    it("should return an error when last name contains only whitespace", () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "   "
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toContain("Last name is required");
    });

    it("should return all relevant validation errors for completely invalid data", () => {
        const data = {
            email: "",
            phone: "",
            password: "",
            firstName: "",
            lastName: ""
        };

        const errors = validateRegisterRequest(data);

        expect(errors).toEqual([
            "Email is required",
            "Phone is required",
            "Password is required",
            "First name is required",
            "Last name is required"
        ]);
    });
});