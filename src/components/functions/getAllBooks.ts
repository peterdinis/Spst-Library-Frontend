import { booksApi } from "@/api/booksApi";
import { createServerFn } from "@tanstack/react-start";

export const getAllBooks = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const books = await booksApi.getAllBooks();
      return {
        success: true,
        data: books,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error fetching books:", error);
      return {
        success: false,
        error: "Failed to fetch books",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  });
