import authApi, { RegisterInput, LoginInput } from "@/api/authApi";
import { createServerFn } from "@tanstack/react-start";

export const testAuthApi = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const response = await authApi.test();
			return {
				success: true,
				data: response,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error testing auth API:", error);
			return {
				success: false,
				error: "Failed to test auth API",
				message: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			};
		}
	},
);

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => {
		// Validácia vstupných dát - môžete použiť Zod schému
		if (!data || typeof data !== 'object') {
			throw new Error("Invalid registration data");
		}
		return data as RegisterInput;
	})
	.handler(
		async ({ data }) => {
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
		if (!data || typeof data !== 'object') {
			throw new Error("Invalid login data");
		}
		
		const loginData = data as Partial<LoginInput>;
		if (!loginData.email || !loginData.password) {
			throw new Error("Email and password are required");
		}
		
		return data as LoginInput;
	})
	.handler(
		async ({ data }) => {
			try {
				const response = await authApi.login(data);
				return {
					success: true,
					data: response,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				console.error("Error logging in:", error);
                
				if (error instanceof Error && error.message.includes("locked")) {
					return {
						success: false,
						error: "Account locked",
						message: "Account locked due to multiple failed attempts",
						timestamp: new Date().toISOString(),
						statusCode: 423,
					};
				}
				
				return {
					success: false,
					error: "Failed to login",
					message: error instanceof Error ? error.message : "Invalid credentials",
					timestamp: new Date().toISOString(),
					statusCode: 401,
				};
			}
		},
	);

export const logoutUser = createServerFn({ method: "POST" }).handler(
	async () => {
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
	async () => {
		try {
			const response = await authApi.getCurrentUser();
			return {
				success: true,
				data: response,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error getting current user:", error);
			
			// Ak užívateľ nie je prihlásený (401)
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