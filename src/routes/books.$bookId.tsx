import { BookDetailPage } from "@/components/books/BookDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$bookId")({
	component: BookDetailPage,
});
