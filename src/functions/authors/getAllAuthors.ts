import { authorsApi } from "@/api/authorsApi";
import { createServerFn } from "@tanstack/react-start";

export const getAllAuthors = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const authors = await authorsApi.getAllAuthors();
			return {
				success: true,
				data: authors,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error fetching authors:", error);
			return {
				success: false,
				error: "Failed to fetch authors",
				message: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			};
		}
	},
);
