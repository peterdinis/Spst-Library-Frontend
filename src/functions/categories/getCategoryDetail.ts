import { categoriesApi } from "@/api/categoriesApi";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const categoryDetailSchema = z.object({
    categoryId: z.string(),
});

export const getCategoryDetail = createServerFn({ method: "GET" })
    .inputValidator(categoryDetailSchema)
    .handler(async ({ data }) => {
        try {
            const category = await categoriesApi.getCategoryById(data.categoryId);

            if (!category) {
                return {
                    success: false,
                    error: "Category not found",
                    timestamp: new Date().toISOString(),
                };
            }

            return {
                success: true,
                data: category,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error fetching category ${data.categoryId}:`, error);
            return {
                success: false,
                error: "Failed to fetch category",
                message: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            };
        }
    });
