import { categoriesApi } from "@/api/categoriesApi";
import { createServerFn } from "@tanstack/react-start";

export const getAllCategories = createServerFn({ method: "GET" }).handler(
    async () => {
        try {
            const categories = await categoriesApi.getAllCategories();
            return {
                success: true,
                data: categories,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error fetching categories:", error);
            return {
                success: false,
                error: "Failed to fetch categories",
                message: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            };
        }
    },
);
