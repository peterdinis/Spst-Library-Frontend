import { CategoryDetail } from "@/components/categories/CategoryDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/categories/$categoryId")({
	component: CategoryDetail,
});
