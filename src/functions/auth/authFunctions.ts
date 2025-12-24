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

// Interface pre Identity chyby
export interface IdentityError {
  code?: string;
  description: string;
}

export interface ApiErrorResponse {
  status: number;
  data?: IdentityError[];
  message?: string;
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
  validationErrors?: ZodFormattedError[];
  identityErrors?: IdentityError[];
};

// Pomocné funkcie pre lepšiu prácu s chybami
export const formatZodError = (error: ZodError<any>): ZodFormattedError[] => {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
};

// Format Identity errors z ASP.NET
export const formatIdentityError = (error: any): IdentityError[] => {
  if (Array.isArray(error)) {
    return error.map(err => ({
      code: err.code,
      description: err.description || err.message || "Unknown error"
    }));
  }
  if (typeof error === 'string') {
    return [{ description: error }];
  }
  return [{ description: "Unknown identity error" }];
};

// Pomocná funkcia pre handle API chýb
export const handleApiError = (error: any): ApiErrorResponse => {
  if (error.status && error.data) {
    return {
      status: error.status,
      data: error.data,
      message: error.message
    };
  }
  return {
    status: 500,
    message: error.message || "Unknown server error"
  };
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
    
    // Frontend validácia hesla pred odoslaním
    const password = data.password;
    if (password) {
      const errors: string[] = [];
      if (!/[0-9]/.test(password)) errors.push("aspoň jednu číslicu");
      if (!/[a-z]/.test(password)) errors.push("aspoň jedno malé písmeno");
      if (!/[A-Z]/.test(password)) errors.push("aspoň jedno veľké písmeno");
      if (!/[^a-zA-Z0-9]/.test(password)) errors.push("aspoň jeden špeciálny znak");
      
      if (errors.length > 0) {
        throw new Error(`Heslo musí obsahovať: ${errors.join(", ")}`);
      }
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
          message: "User registered successfully"
        };
      } catch (error: any) {
        console.error("Error registering user:", error);
        
        const apiError = handleApiError(error);
        
        return {
          success: false,
          error: apiError.data?.[0]?.code || "Failed to register user",
          message: apiError.data?.[0]?.description || "Registration failed",
          timestamp: new Date().toISOString(),
          statusCode: apiError.status,
          identityErrors: apiError.data,
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
          message: "Prihlásenie úspešné"
        } as AuthServerResponse<UserResponseDto>;
      } catch (error: any) {
        console.error("Error logging in:", error);
        
        const apiError = handleApiError(error);
        
        // Špecifické chyby pre lockout
        if (apiError.status === 423) {
          return {
            success: false,
            error: "Účet zablokovaný",
            message: "Účet je dočasne zablokovaný kvôli viacerým neúspešným pokusom. Skúste to neskôr.",
            timestamp: new Date().toISOString(),
            statusCode: 423,
          } as AuthServerResponse<undefined>;
        }
        
        // Chyba pre nesprávne prihlasovacie údaje
        if (apiError.status === 401) {
          return {
            success: false,
            error: "Neplatné prihlasovacie údaje",
            message: "Skontrolujte email a heslo",
            timestamp: new Date().toISOString(),
            statusCode: 401,
          } as AuthServerResponse<undefined>;
        }
        
        // Generická chyba
        return {
          success: false,
          error: "Login failed",
          message: apiError.message || "Prihlásenie zlyhalo",
          timestamp: new Date().toISOString(),
          statusCode: apiError.status,
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
        message: "Logged out successfully"
      };
    } catch (error: any) {
      console.error("Error logging out:", error);
      return {
        success: false,
        error: "Failed to logout",
        message: error instanceof Error ? error.message : "Odhlásenie zlyhalo",
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
        message: "User retrieved successfully"
      };
    } catch (error: any) {
      console.error("Error getting current user:", error);
      if (error.status === 401) {
        return {
          success: false,
          error: "Not authenticated",
          message: "Nie ste prihlásený",
          timestamp: new Date().toISOString(),
          statusCode: 401,
        };
      }
      return {
        success: false,
        error: "Failed to get current user",
        message: error instanceof Error ? error.message : "Nepodarilo sa načítať používateľa",
        timestamp: new Date().toISOString(),
      };
    }
  },
);

// Validácia potvrdenia hesla pre registráciu
const registerWithConfirmSchema = registerSchema.extend({
  confirmPassword: z.string().min(1, "Potvrdenie hesla je povinné")
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Heslá sa nezhodujú",
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
          message: "Úspešne zaregistrovaný"
        };
      } catch (error: any) {
        console.error("Error registering user:", error);
        
        const apiError = handleApiError(error);
        
        return {
          success: false,
          error: "Registration failed",
          message: apiError.data?.[0]?.description || "Registrácia zlyhala",
          timestamp: new Date().toISOString(),
          statusCode: apiError.status,
          identityErrors: apiError.data,
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
  const emailSchema = z.string().email("Neplatná emailová adresa");
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Heslo musí mať aspoň 6 znakov");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Heslo musí obsahovať aspoň jednu číslicu");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Heslo musí obsahovať aspoň jedno malé písmeno");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Heslo musí obsahovať aspoň jedno veľké písmeno");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Heslo musí obsahovať aspoň jeden špeciálny znak");
  }
  
  return {
    isValid: errors.length === 0,
    errors
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
  formatIdentityError,
  handleApiError,
  isRegisterInput,
  isLoginInput,
  safeInputValidator,
} as const;

export default authFunctions;