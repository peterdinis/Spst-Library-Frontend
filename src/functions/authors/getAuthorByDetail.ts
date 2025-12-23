import { authorsApi } from "@/api/authorsApi";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const authorDetailSchema = z.object({
    authorId: z.string(),
});

export const getAuthorDetail = createServerFn({ method: "GET" })
    .inputValidator(authorDetailSchema)
    .handler(async ({ data }) => {
        try {
            const author = await authorsApi.getAuthorById(data.authorId);

            if (!author) {
                return {
                    success: false,
                    error: "Author not found",
                    timestamp: new Date().toISOString(),
                };
            }

            return {
                success: true,
                data: author,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error fetching author ${data.authorId}:`, error);
            return {
                success: false,
                error: "Failed to fetch author",
                message: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            };
        }
    });
