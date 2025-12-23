import { env } from "@/env";

export const authorsApi = {
    getAllAuthors: async () => {
        const response = await fetch(`${env.VITE_BACKEND_AUTHORS_API}`);
        if (!response.ok) throw new Error("Failed to fetch authors");
        return response.json();
    },

    getAuthorById: async (id: string | number) => {
        const response = await fetch(`${env.VITE_BACKEND_AUTHORS_API}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch author");
        return response.json();
    },

    createAuthor: async (authorData: any) => {
        const response = await fetch(`${env.VITE_BACKEND_AUTHORS_API}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authorData),
        });
        if (!response.ok) throw new Error("Failed to create author");
        return response.json();
    },

    updateAuthor: async (id: string | number, authorData: any) => {
        const response = await fetch(`${env.VITE_BACKEND_AUTHORS_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authorData),
        });
        if (!response.ok) throw new Error("Failed to update author");
        return response.json();
    },

    deleteBook: async (id: string | number) => {
        const response = await fetch(`${env.VITE_BACKEND_AUTHORS_API}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete author");
        return response.ok;
    },
};
