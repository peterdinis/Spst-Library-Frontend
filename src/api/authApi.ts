import { env } from "@/env";

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role?: "Admin" | "Teacher" | "Student";
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface ApiError {
  message: string;
  errors?: Array<{ code: string; description: string }>;
}

export interface AuthResponse {
  message: string;
  timestamp?: string;
  [key: string]: any;
}

export const authApi = {
  // Testovacie endpointy
  test: async (): Promise<AuthResponse> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/test`);
    if (!response.ok) throw new Error("Failed to test auth API");
    return response.json();
  },

  health: async (): Promise<AuthResponse> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/health`);
    if (!response.ok) throw new Error("Failed to get health status");
    return response.json();
  },

  ping: async (): Promise<string> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/ping`);
    if (!response.ok) throw new Error("Failed to ping");
    return response.text();
  },

  // Hlavné auth endpointy
  register: async (registerData: RegisterDto): Promise<AuthResponse> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ 
        message: "Registration failed" 
      }));
      throw new Error(errorData.message || "Failed to register user");
    }

    return response.json();
  },

  login: async (loginData: LoginDto): Promise<UserResponseDto> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: 'include', // Dôležité pre cookies/sessions
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      if (response.status === 423) {
        throw new Error("Account locked due to multiple failed attempts");
      }
      
      const errorData: ApiError = await response.json().catch(() => ({ 
        message: "Login failed" 
      }));
      throw new Error(errorData.message || "Invalid credentials");
    }

    return response.json();
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error("Failed to logout");
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<UserResponseDto> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/current-user`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error("Failed to get current user");
    }

    return response.json();
  },

  // Pomocná metóda pre prístup zamietnutý
  accessDenied: async (): Promise<AuthResponse> => {
    const response = await fetch(`${env.VITE_BACKEND_IDENTITY_API}/auth/access-denied`);
    if (!response.ok) throw new Error("Failed to get access denied info");
    return response.json();
  },
};

// Validácia pomocou Zod
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["Admin", "Teacher", "Student"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  roles: z.array(z.string()),
});

// Type inference z validátorov
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

// Pomocná funkcia pre validáciu s error handlingom
export const validateAndCall = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const validated = registerSchema.parse(data);
    return authApi.register(validated);
  },

  login: async (data: LoginInput): Promise<UserResponseDto> => {
    const validated = loginSchema.parse(data);
    return authApi.login(validated);
  },
};

// Vytvorenie auth service s lepším error handlingom
export class AuthService {
  private baseUrl = env.VITE_BACKEND_IDENTITY_API;
  private defaultHeaders = {
    "Content-Type": "application/json",
  };

  async register(data: RegisterInput) {
    return this.makeRequest<AuthResponse>("/auth/register", "POST", data);
  }

  async login(data: LoginInput) {
    return this.makeRequest<UserResponseDto>("/auth/login", "POST", data, {
      credentials: 'include',
    });
  }

  async logout() {
    return this.makeRequest<AuthResponse>("/auth/logout", "POST", undefined, {
      credentials: 'include',
    });
  }

  async getCurrentUser() {
    return this.makeRequest<UserResponseDto>("/auth/current-user", "GET", undefined, {
      credentials: 'include',
    });
  }

  async test() {
    return this.makeRequest<AuthResponse>("/auth/test", "GET");
  }

  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: this.defaultHeaders,
      ...options,
    };

    if (data && method !== "GET") {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
          response.status,
          errorData?.message || `HTTP error ${response.status}`,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Custom Error class pre lepší error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export default instance
export default new AuthService();