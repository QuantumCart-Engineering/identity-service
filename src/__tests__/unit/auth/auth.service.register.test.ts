import bcrypt from "bcrypt";

import { registerUser } from "../../../services/auth.service";

import {
    findUserByEmail,
    findUserByPhone,
    createUser
} from "../../../repositories/user.repository";

import { validateRegisterRequest } from "../../../validators/auth/register.validator";

jest.mock("bcrypt");

jest.mock("../../../repositories/user.repository", () => ({
    findUserByEmail: jest.fn(),
    findUserByPhone: jest.fn(),
    createUser: jest.fn()
}));

jest.mock("../../../validators/auth/register.validator", () => ({
    validateRegisterRequest: jest.fn()
}));

const mockedValidateRegisterRequest =
    validateRegisterRequest as jest.MockedFunction<
        typeof validateRegisterRequest
    >;

const mockedFindUserByEmail =
    findUserByEmail as jest.MockedFunction<
        typeof findUserByEmail
    >;

const mockedFindUserByPhone =
    findUserByPhone as jest.MockedFunction<
        typeof findUserByPhone
    >;

const mockedCreateUser =
    createUser as jest.MockedFunction<
        typeof createUser
    >;

const mockedBcryptHash =
    bcrypt.hash as jest.MockedFunction<
        typeof bcrypt.hash
    >;

describe("registerUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully register a new user", async () => {
        const data = {
            email: "Test@Example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: " Test ",
            lastName: " User "
        };

        mockedValidateRegisterRequest.mockReturnValue([]);

        mockedFindUserByEmail.mockResolvedValue([]);

        mockedFindUserByPhone.mockResolvedValue([]);

        mockedBcryptHash.mockResolvedValue(
            "hashed-password" as never
        );

        mockedCreateUser.mockResolvedValue(
            undefined as never
        );

        const result = await registerUser(data);

        expect(result).toEqual({
            id: expect.any(String),
            email: "test@example.com",
            phone: "9876543210",
            firstName: "Test",
            lastName: "User"
        });

        expect(mockedFindUserByEmail)
            .toHaveBeenCalledWith("test@example.com");

        expect(mockedFindUserByPhone)
            .toHaveBeenCalledWith("9876543210");

        expect(mockedBcryptHash)
            .toHaveBeenCalledWith(
                "Password@123",
                12
            );

        expect(mockedCreateUser)
            .toHaveBeenCalledWith(
                expect.any(String),
                "test@example.com",
                "9876543210",
                "hashed-password",
                "Test",
                "User"
            );
    });

    it("should reject registration when validation fails", async () => {
        const data = {
            email: "invalid-email",
            phone: "12345",
            password: "123",
            firstName: "Test",
            lastName: "User"
        };

        mockedValidateRegisterRequest.mockReturnValue([
            "Invalid email format",
            "Phone must contain exactly 10 digits"
        ]);

        await expect(
            registerUser(data)
        ).rejects.toThrow(
            "Invalid email format, Phone must contain exactly 10 digits"
        );

        expect(
            mockedFindUserByEmail
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateUser
        ).not.toHaveBeenCalled();
    });

    it("should reject registration when email already exists", async () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        mockedValidateRegisterRequest.mockReturnValue([]);

        mockedFindUserByEmail.mockResolvedValue([
            {
                id: "existing-user"
            }
        ] as any);

        await expect(
            registerUser(data)
        ).rejects.toThrow(
            "Email is already registered"
        );

        expect(
            mockedFindUserByPhone
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateUser
        ).not.toHaveBeenCalled();
    });

    it("should reject registration when phone already exists", async () => {
        const data = {
            email: "test@example.com",
            phone: "9876543210",
            password: "Password@123",
            firstName: "Test",
            lastName: "User"
        };

        mockedValidateRegisterRequest.mockReturnValue([]);

        mockedFindUserByEmail.mockResolvedValue([]);

        mockedFindUserByPhone.mockResolvedValue([
            {
                id: "existing-user"
            }
        ] as any);

        await expect(
            registerUser(data)
        ).rejects.toThrow(
            "Phone is already registered"
        );

        expect(
            mockedCreateUser
        ).not.toHaveBeenCalled();

        expect(
            mockedBcryptHash
        ).not.toHaveBeenCalled();
    });
});