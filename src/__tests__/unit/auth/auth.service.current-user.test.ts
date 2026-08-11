import { getCurrentUser } from "../../../services/auth.service";

import { findUserById } from "../../../repositories/user.repository";

jest.mock("../../../repositories/user.repository", () => ({
    findUserById: jest.fn()
}));

const mockedFindUserById =
    findUserById as jest.Mock;

describe("getCurrentUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the current user when user is active", async () => {
        const user = {
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            first_name: "Test",
            last_name: "User",
            status: "ACTIVE",
            email_verified: 0,
            phone_verified: 0,
            created_at: new Date("2026-08-10T07:04:42.000Z"),
            updated_at: new Date("2026-08-10T07:04:42.000Z")
        };

        mockedFindUserById.mockResolvedValue([
            user
        ]);

        const result = await getCurrentUser("user-123");

        expect(result).toEqual({
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            firstName: "Test",
            lastName: "User",
            status: "ACTIVE",
            emailVerified: 0,
            phoneVerified: 0,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        });

        expect(mockedFindUserById)
            .toHaveBeenCalledWith("user-123");
    });

    it("should throw an error when user does not exist", async () => {
        mockedFindUserById.mockResolvedValue([]);

        await expect(
            getCurrentUser("unknown-user")
        ).rejects.toThrow("User not found");

        expect(mockedFindUserById)
            .toHaveBeenCalledWith("unknown-user");
    });

    it("should throw an error when user account is inactive", async () => {
        const inactiveUser = {
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            first_name: "Test",
            last_name: "User",
            status: "INACTIVE",
            email_verified: 0,
            phone_verified: 0,
            created_at: new Date("2026-08-10T07:04:42.000Z"),
            updated_at: new Date("2026-08-10T07:04:42.000Z")
        };

        mockedFindUserById.mockResolvedValue([
            inactiveUser
        ]);

        await expect(
            getCurrentUser("user-123")
        ).rejects.toThrow(
            "User account is not active"
        );
    });
});