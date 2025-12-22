import { booksApi } from "@/api/booksApi";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const bookDetailSchema = z.object({
    bookId: z.string(),
});

export const getBookDetail = createServerFn({ method: "GET" })
    .inputValidator(bookDetailSchema)
    .handler(async ({ data }) => {
        try {
            const book = await booksApi.getBookById(data.bookId);

            if (!book) {
                return {
                    success: false,
                    error: "Book not found",
                    timestamp: new Date().toISOString()
                };
            }

            return {
                success: true,
                data: book,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching book ${data.bookId}:`, error);
            return {
                success: false,
                error: "Failed to fetch book",
                message: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            };
        }
    });