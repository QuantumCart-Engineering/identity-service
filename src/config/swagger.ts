import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "QuantumCart Identity Service API",
        version: "1.0.0",
        description:
            "Authentication and identity management API for QuantumCart."
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 8001}`,
            description: "Local development server"
        }
    ],
    tags: [
        {
            name: "Health",
            description: "Service health endpoints"
        },
        {
            name: "Authentication",
            description:
                "User registration and authentication endpoints"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },

        schemas: {
            RegisterRequest: {
                type: "object",
                required: [
                    "email",
                    "phone",
                    "password",
                    "firstName",
                    "lastName"
                ],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example: "john@example.com"
                    },
                    phone: {
                        type: "string",
                        example: "9876543210"
                    },
                    password: {
                        type: "string",
                        format: "password",
                        example: "Password@123"
                    },
                    firstName: {
                        type: "string",
                        example: "John"
                    },
                    lastName: {
                        type: "string",
                        example: "Doe"
                    }
                }
            },

            LoginRequest: {
                type: "object",
                required: [
                    "email",
                    "password"
                ],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example: "john@example.com"
                    },
                    password: {
                        type: "string",
                        format: "password",
                        example: "Password@123"
                    }
                }
            },

            RefreshTokenRequest: {
                type: "object",
                required: [
                    "refreshToken"
                ],
                properties: {
                    refreshToken: {
                        type: "string",
                        example:
                            "refresh-token-value"
                    }
                }
            },

            LogoutRequest: {
                type: "object",
                required: [
                    "refreshToken"
                ],
                properties: {
                    refreshToken: {
                        type: "string",
                        example:
                            "refresh-token-value"
                    }
                }
            },

            User: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid",
                        example:
                            "550e8400-e29b-41d4-a716-446655440000"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example:
                            "john@example.com"
                    },
                    phone: {
                        type: "string",
                        example: "9876543210"
                    },
                    firstName: {
                        type: "string",
                        example: "John"
                    },
                    lastName: {
                        type: "string",
                        example: "Doe"
                    },
                    status: {
                        type: "string",
                        example: "ACTIVE"
                    },
                    emailVerified: {
                        type: "boolean",
                        example: false
                    },
                    phoneVerified: {
                        type: "boolean",
                        example: false
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },

            ErrorResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false
                    },
                    message: {
                        type: "string",
                        example:
                            "Invalid email or password"
                    }
                }
            }
        }
    }
};

const swaggerOptions = {
    definition: swaggerDefinition,

    apis: [
        "./src/routes/*.ts",
        "./src/controllers/*.ts"
    ]
};

export const swaggerSpec =
    swaggerJSDoc(swaggerOptions);