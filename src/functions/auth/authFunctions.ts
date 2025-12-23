import authApi, {
  RegisterInput,
  LoginInput,
  registerSchema,
  loginSchema,
  UserResponseDto,
  AuthResponse
} from "@/api/authApi";
import { createServerFn } from "@tanstack/react-start";
import { z, ZodError, ZodIssue } from "zod";

// Definícia typov pre input
export type RegisterWithConfirmInput = RegisterInput & {
  confirmPassword: string;
};

// Error types
export interface ZodFormattedError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationError {
  errors: ZodFormattedError[];
  message: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// Type pre odpoveď server funkcií
export type AuthServerResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  statusCode?: number;
  details?: string;
};

// Pomocné funkcie pre lepšiu prácu s chybami
export const formatZodError = (error: ZodError<any>): ZodFormattedError[] => {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
};

export const testAuthApi = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const response = await authApi.test();
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      } as const;
    } catch (error) {
      console.error("Error testing auth API:", error);
      return {
        success: false,
        error: "Failed to test auth API",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      } as const;
    }
  },
);

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterInput) => {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
    }
    return result.data;
  })
  .handler(
    async ({ data }): Promise<AuthServerResponse<AuthResponse>> => {
      try {
        const response = await authApi.register(data);
        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Error registering user:", error);
        return {
          success: false,
          error: "Failed to register user",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          details: error instanceof Error ? error.stack : undefined,
        };
      }
    },
  );

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
    }
    return result.data;
  })
  .handler(
    async ({ data }) => {
      try {
        const response = await authApi.login(data);
        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        } as AuthServerResponse<UserResponseDto>;
      } catch (error) {
        console.error("Error logging in:", error);
        if (error instanceof Error && error.message.includes("locked")) {
          return {
            success: false,
            error: "Account locked",
            message: "Account locked due to multiple failed attempts",
            timestamp: new Date().toISOString(),
            statusCode: 423,
          } as AuthServerResponse<undefined>;
        }
        return {
          success: false,
          error: "Failed to login",
          message: error instanceof Error ? error.message : "Invalid credentials",
          timestamp: new Date().toISOString(),
          statusCode: 401,
        } as AuthServerResponse<undefined>;
      }
    },
  );

export const logoutUser = createServerFn({ method: "POST" }).handler(
  async (): Promise<AuthServerResponse<AuthResponse>> => {
    try {
      const response = await authApi.logout();
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error logging out:", error);
      return {
        success: false,
        error: "Failed to logout",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
);

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthServerResponse<UserResponseDto | undefined>> => {
    try {
      const response = await authApi.getCurrentUser();
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      if (error instanceof Error && error.message.includes("Not authenticated")) {
        return {
          success: false,
          error: "Not authenticated",
          message: "User is not logged in",
          timestamp: new Date().toISOString(),
          statusCode: 401,
        };
      }
      return {
        success: false,
        error: "Failed to get current user",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
);

// Validácia potvrdenia hesla pre registráciu
const registerWithConfirmSchema = registerSchema.extend({
  confirmPassword: z.string().min(6, "Password confirmation is required")
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
);

// Infer typ z Zod schémy
export type RegisterWithConfirmInputZod = z.infer<typeof registerWithConfirmSchema>;

export const registerWithConfirmUser = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterWithConfirmInputZod) => {
    const result = registerWithConfirmSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
    }
    return result.data;
  })
  .handler(
    async ({ data }): Promise<AuthServerResponse<AuthResponse>> => {
      try {
        const { confirmPassword, ...registrationData } = data;
        const response = await authApi.register(registrationData);
        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Error registering user:", error);
        return {
          success: false,
          error: "Failed to register user",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          details: error instanceof Error ? error.stack : undefined,
        };
      }
    },
  );

// Type guards pre validáciu
export const isRegisterInput = (data: unknown): data is RegisterInput => {
  return registerSchema.safeParse(data).success;
};

export const isLoginInput = (data: unknown): data is LoginInput => {
  return loginSchema.safeParse(data).success;
};

// Safe validátor funkcia
export const safeInputValidator = <T>(data: unknown, schema: z.ZodSchema<T>): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = formatZodError(result.error);
    throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
  }
  return result.data;
};

// Validácia len pre konkrétne polia
export const validateEmail = (email: string): boolean => {
  const emailSchema = z.string().email("Invalid email address");
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): PasswordValidationResult => {
  const passwordSchema = z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password is too long");

  const result = passwordSchema.safeParse(password);

  if (result.success) {
    return {
      isValid: true,
      errors: []
    };
  }

  return {
    isValid: false,
    errors: result.error.issues.map((err: ZodIssue) => err.message)
  };
};

export const authFunctions = {
  testAuthApi,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  registerWithConfirmUser,
  validateEmail,
  validatePassword,
  formatZodError,
  isRegisterInput,
  isLoginInput,
  safeInputValidator,
} as const;

export default authFunctions;