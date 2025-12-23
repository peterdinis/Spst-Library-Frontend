import { env } from "@/env";

export const categoriesApi = {
	getAllCategories: async () => {
		const response = await fetch(`${env.VITE_BACKEND_CATEGORIES_API}`);
		if (!response.ok) throw new Error("Failed to fetch categories");
		return response.json();
	},

	getCategoryById: async (id: string | number) => {
		const response = await fetch(`${env.VITE_BACKEND_CATEGORIES_API}/${id}`);
		if (!response.ok) throw new Error("Failed to fetch category");
		return response.json();
	},

	createCategory: async (categoryData: any) => {
		const response = await fetch(`${env.VITE_BACKEND_CATEGORIES_API}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(categoryData),
		});
		if (!response.ok) throw new Error("Failed to create category");
		return response.json();
	},

	updateCategory: async (id: string | number, categoryData: any) => {
		const response = await fetch(`${env.VITE_BACKEND_CATEGORIES_API}/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(categoryData),
		});
		if (!response.ok) throw new Error("Failed to update category");
		return response.json();
	},

	deleteCategory: async (id: string | number) => {
		const response = await fetch(`${env.VITE_BACKEND_CATEGORIES_API}/${id}`, {
			method: "DELETE",
		});
		if (!response.ok) throw new Error("Failed to delete category");
		return response.ok;
	},
};
