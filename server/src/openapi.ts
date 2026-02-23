const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "My Favorite Addresses API",
    version: "1.0.0",
    description: "API documentation for users and favorite addresses management.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "number" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "createdAt"],
      },
      Address: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          lng: { type: "number" },
          lat: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "lng", "lat", "createdAt"],
      },
      CreateUserRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      CreateTokenRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      CreateAddressRequest: {
        type: "object",
        properties: {
          searchWord: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
        },
        required: ["searchWord", "name"],
      },
      SearchAddressesRequest: {
        type: "object",
        properties: {
          radius: { type: "number", minimum: 0 },
          from: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
            required: ["lat", "lng"],
          },
        },
        required: ["radius", "from"],
      },
      TokenResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
        required: ["token"],
      },
    },
  },
  paths: {
    "/api/users": {
      post: {
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    item: { $ref: "#/components/schemas/User" },
                  },
                  required: ["item"],
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/tokens": {
      post: {
        summary: "Get an authentication token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTokenRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token generated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "400": {
            description: "Wrong credentials or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    item: { $ref: "#/components/schemas/User" },
                  },
                  required: ["item"],
                },
              },
            },
          },
          "403": {
            description: "Access denied",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/addresses": {
      get: {
        summary: "List current user addresses",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Addresses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Address" },
                    },
                  },
                  required: ["items"],
                },
              },
            },
          },
          "403": {
            description: "Access denied",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create an address from a search word",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAddressRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Address created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    item: { $ref: "#/components/schemas/Address" },
                  },
                  required: ["item"],
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Access denied",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Search word not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/addresses/searches": {
      post: {
        summary: "Search addresses within a radius from coordinates",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SearchAddressesRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Filtered addresses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Address" },
                    },
                  },
                  required: ["items"],
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Access denied",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default openApiDocument;
