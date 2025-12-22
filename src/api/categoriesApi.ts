import { env } from "@/env";

export const booksApi = {
    getAllBooks: async () => {
        const response = await fetch(`${env.VITE_BACKEND_BOOKS_API}`);
        if (!response.ok) throw new Error("Failed to fetch books");
        return response.json();
    },

    getBookById: async (id: string | number) => {
        const response = await fetch(`${env.VITE_BACKEND_BOOKS_API}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch book");
        return response.json();
    },

    createBook: async (bookData: any) => {
        const response = await fetch(`${env.VITE_BACKEND_BOOKS_API}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error("Failed to create book");
        return response.json();
    },

    updateBook: async (id: string | number, bookData: any) => {
        const response = await fetch(`${env.VITE_BACKEND_BOOKS_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error("Failed to update book");
        return response.json();
    },

    deleteBook: async (id: string | number) => {
        const response = await fetch(`${env.VITE_BACKEND_BOOKS_API}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete book");
        return response.ok;
    },
};
