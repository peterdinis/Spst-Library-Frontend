import { AuthorDetail } from "@/components/authors/AuthorDetail";
import { BookDetailPage } from "@/components/books/BookDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/authors/$authorId")({
	component: AuthorDetail,
});
