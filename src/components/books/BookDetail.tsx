"use client";

import { Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
	Book as BookIcon,
	Calendar,
	User,
	BookOpen,
	Clock,
	ArrowLeft,
	Heart,
	Globe,
	Tag,
	Info,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getBookDetail } from "../../functions/books/getBookDetail";

// Types
type Book = {
	id: string;
	title: string;
	authorId?: string;
	authorName?: string;
	categoryName?: string;
	category?: string;
	isbn?: string;
	publishedYear?: number;
	year?: number;
	availableCopies?: number;
	totalCopies?: number;
	coverUrl?: string;
	description?: string;
	language?: string;
	publisher?: string;
	pages?: number;
	isAvailable?: boolean;
	author?: string;
	categoryId?: string;
	photoPath?: string;
	addedToLibrary?: string;
};

type Author = {
	id: string;
	name: string;
	biography?: string;
	photoUrl?: string;
	nationality?: string;
};

type Borrow = {
	id: string;
	bookId: string;
	userId: string;
	borrowDate: Date;
	dueDate: Date;
	returnedDate?: Date;
};

// Similar books data - budeme načítavať dynamicky alebo ponecháme statické
const similarBooksData = [
	{
		id: "1",
		title: "Harry Potter a Tajomná komnata",
		authorName: "J.K. Rowling",
		categoryName: "Fantasy",
		availableCopies: 2,
	},
	{
		id: "6",
		title: "Hobbit",
		authorName: "J.R.R. Tolkien",
		categoryName: "Fantasy",
		availableCopies: 3,
	},
];

// Simulated auth state
const useAuth = () => ({
	isAuthenticated: true,
	user: { id: "1", name: "Test User", email: "test@example.com" },
});

// Simulated borrows state
const useBorrows = () => {
	const [borrows, setBorrows] = useState<Borrow[]>([
		{
			id: "borrow1",
			bookId: "1",
			userId: "1",
			borrowDate: new Date("2024-01-15"),
			dueDate: new Date("2024-02-15"),
		},
	]);

	const activeBorrows = borrows.filter((b) => !b.returnedDate);

	const checkHasBorrowed = (bookId: string) => {
		return activeBorrows.some((b) => b.bookId === bookId);
	};

	const borrowBook = async (bookId: string) => {
		const newBorrow: Borrow = {
			id: `borrow${Date.now()}`,
			bookId,
			userId: "1",
			borrowDate: new Date(),
			dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		};

		setBorrows((prev) => [...prev, newBorrow]);

		console.log(`Book ${bookId} borrowed`);

		return newBorrow.id;
	};

	const returnBook = async (borrowId: string) => {
		setBorrows((prev) =>
			prev.map((b) =>
				b.id === borrowId ? { ...b, returnedDate: new Date() } : b,
			),
		);

		console.log(`Borrow ${borrowId} returned`);
	};

	return {
		activeBorrows,
		checkHasBorrowed,
		borrowBook,
		returnBook,
	};
};

export function BookDetailPage() {
	const { bookId } = useParams({ from: "/books/$bookId" });
	const [isBorrowed, setIsBorrowed] = useState(false);
	const [currentBorrowId, setCurrentBorrowId] = useState<string | null>(null);
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertType, setAlertType] = useState<"success" | "error" | "warning">(
		"success",
	);

	const auth = useAuth();
	const borrows = useBorrows();

	// Použitie useQuery na získanie dát o knihe
	const {
		data: book,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["book", bookId],
		queryFn: async () => {
			if (!bookId) return null;

			const result = await getBookDetail({ data: { bookId } });
			if (!result) return null;

			// Transformácia dát z API na náš formát
			return {
				id: result.data.id?.toString() || "",
				title: result.data.title || "",
				authorId: result.data.authorId?.toString(),
				authorName: result.data.author || result.data.authorName,
				categoryName: result.data.category || result.data.categoryName,
				isbn: result.data.isbn,
				publishedYear: result.data.year || result.data.publishedYear,
				availableCopies: result.data.availableCopies || 1,
				totalCopies: result.data.totalCopies || 1,
				coverUrl: result.data.photoPath || result.data.coverUrl,
				description: result.data.description,
				language: result.data.language,
				publisher: result.data.publisher,
				pages: result.data.pages,
				isAvailable: result.data.isAvailable,
				author: result.data.author,
				category: result.data.category,
				photoPath: result.data.photoPath,
				addedToLibrary: result.data.addedToLibrary,
			} as Book;
		},
		enabled: !!bookId,
		retry: 2,
	});

	useEffect(() => {
		if (book && auth.isAuthenticated) {
			checkBorrowStatus();
		}
	}, [book, borrows.activeBorrows, auth.isAuthenticated]);

	const checkBorrowStatus = () => {
		if (!book || !auth.isAuthenticated) return;

		const hasBorrowed = borrows.checkHasBorrowed(book.id);
		setIsBorrowed(hasBorrowed);

		if (hasBorrowed) {
			const activeBorrow = borrows.activeBorrows.find(
				(b) => b.bookId === book.id,
			);
			if (activeBorrow) {
				setCurrentBorrowId(activeBorrow.id);
			}
		}
	};

	const handleBorrow = async () => {
		if (!book || !auth.isAuthenticated) {
			setAlertMessage("Pre vypožičanie knihy sa musíte prihlásiť");
			setAlertType("warning");
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 5000);
			return;
		}

		try {
			if (book.availableCopies === 0 || !book.isAvailable) {
				throw new Error("Kniha je momentálne vypožičaná");
			}

			const borrowId = await borrows.borrowBook(book.id);
			setIsBorrowed(true);
			setCurrentBorrowId(borrowId);
			setAlertMessage(
				"Kniha bola úspešne vypožičaná. Vrátiť ju musíte do 30 dní.",
			);
			setAlertType("success");
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 5000);

			// Refetch na získanie aktuálnych dát
			refetch();
		} catch (error: any) {
			setAlertMessage(error.message || "Chyba pri vypožičaní knihy");
			setAlertType("error");
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 5000);
		}
	};

	const handleReturn = async () => {
		if (!currentBorrowId) return;

		try {
			await borrows.returnBook(currentBorrowId);
			setIsBorrowed(false);
			setCurrentBorrowId(null);
			setAlertMessage("Kniha bola úspešne vrátená. Ďakujeme!");
			setAlertType("success");
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 5000);

			// Refetch na získanie aktuálnych dát
			refetch();
		} catch (error: any) {
			setAlertMessage(error.message || "Chyba pri vrátení knihy");
			setAlertType("error");
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 5000);
		}
	};

	// Loading skeleton
	if (isLoading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<div className="mb-6">
						<Skeleton className="h-10 w-32" />
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="md:col-span-1 space-y-4">
							<Skeleton className="h-96 w-full rounded-xl" />
							<Skeleton className="h-12 w-full" />
						</div>
						<div className="md:col-span-2 space-y-6">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardContent className="p-8 text-center space-y-4">
						<AlertCircle className="h-12 w-12 text-destructive mx-auto" />
						<h2 className="text-2xl font-bold">Chyba pri načítaní</h2>
						<p className="text-muted-foreground">
							{error instanceof Error
								? error.message
								: "Nepodarilo sa načítať detaily knihy"}
						</p>
						<div className="flex gap-2 justify-center mt-4">
							<Button onClick={() => refetch()}>Skúsiť znova</Button>
							<Button asChild variant="outline">
								<Link to="/books">Späť na zoznam kníh</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!book) {
		return (
			<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardContent className="p-8 text-center space-y-4">
						<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
						<h2 className="text-2xl font-bold">Kniha nebola nájdená</h2>
						<p className="text-muted-foreground">
							Požadovaná kniha neexistuje alebo bola odstránená
						</p>
						<Button asChild className="mt-4">
							<Link to="/books">Späť na zoznam kníh</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const currentBorrow = borrows.activeBorrows.find((b) => b.bookId === book.id);

	// Vytvorenie fiktívneho autora z dát knihy (môžete pridať API pre autora)
	const author: Author = {
		id: book.authorId || "unknown",
		name: book.authorName || book.author || "Neznámy autor",
		biography: "",
		nationality: "",
	};

	const alertVariants = {
		success: "border-green-200 bg-green-50 dark:bg-green-900/20",
		error: "border-red-200 bg-red-50 dark:bg-red-900/20",
		warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
	};

	const availableCopies = book.availableCopies || 0;
	const totalCopies = book.totalCopies || 0;
	const isBookAvailable = book.isAvailable !== false && availableCopies > 0;

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
				>
					<Button variant="ghost" asChild className="mb-6">
						<Link to="/books" className="flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Späť na zoznam kníh
						</Link>
					</Button>
				</motion.div>

				<AnimatePresence>
					{showAlert && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="mb-6"
						>
							<Alert className={alertVariants[alertType]}>
								{alertType === "success" && <CheckCircle className="h-4 w-4" />}
								{alertType === "error" && <AlertCircle className="h-4 w-4" />}
								{alertType === "warning" && <Info className="h-4 w-4" />}
								<AlertDescription
									className={
										alertType === "success"
											? "text-green-800 dark:text-green-200"
											: alertType === "error"
												? "text-red-800 dark:text-red-200"
												: "text-yellow-800 dark:text-yellow-200"
									}
								>
									{alertMessage}
								</AlertDescription>
							</Alert>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Book Cover & Actions */}
					<motion.div
						className="lg:col-span-1 space-y-6"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Card className="overflow-hidden shadow-xl border-border/50">
							<div className="relative">
								{book.coverUrl || book.photoPath ? (
									<img
										src={book.coverUrl || book.photoPath}
										alt={book.title}
										className="w-full h-96 object-cover"
										loading="lazy"
									/>
								) : (
									<div className="bg-linear-to-br from-primary/80 to-purple-600 h-96 flex items-center justify-center relative overflow-hidden">
										<div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
										<BookIcon className="h-48 w-48 text-white/20" />
										<div className="absolute inset-0 flex items-center justify-center p-8">
											<div className="text-center text-white">
												<h3 className="text-2xl font-bold mb-2">
													{book.title}
												</h3>
												<p className="text-lg opacity-90">
													{book.authorName || book.author}
												</p>
											</div>
										</div>
									</div>
								)}
								<Badge className="absolute top-4 right-4">
									{book.categoryName || book.category || "Kategória"}
								</Badge>
							</div>

							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
									<div className="space-y-1">
										<div className="text-2xl font-bold text-primary">
											{availableCopies}/{totalCopies}
										</div>
										<div className="text-sm text-muted-foreground">
											dostupné kópie
										</div>
									</div>
									<Badge className="text-sm py-2 px-4">
										{isBookAvailable ? "Dostupné" : "Vypožičané"}
									</Badge>
								</div>

								<AnimatePresence mode="wait">
									{!isBorrowed && isBookAvailable ? (
										<motion.div
											key="borrow"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.2 }}
											className="space-y-4"
										>
											<Button
												onClick={handleBorrow}
												className="w-full h-12 text-lg"
												disabled={!auth.isAuthenticated}
											>
												<BookOpen className="mr-2 h-5 w-5" />
												{auth.isAuthenticated
													? "Požičať knihu"
													: "Prihláste sa"}
											</Button>

											{!auth.isAuthenticated && (
												<Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
													<Info className="h-4 w-4 text-yellow-600" />
													<AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
														Pre vypožičanie knihy sa musíte prihlásiť
													</AlertDescription>
												</Alert>
											)}
										</motion.div>
									) : isBorrowed && currentBorrow ? (
										<motion.div
											key="return"
											className="space-y-4"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.2 }}
										>
											<Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
												<Clock className="h-4 w-4 text-blue-600" />
												<AlertDescription className="text-blue-800 dark:text-blue-200">
													<div className="space-y-1">
														<div>Vypožičané do:</div>
														<div className="font-bold">
															{currentBorrow.dueDate.toLocaleDateString(
																"sk-SK",
															)}
														</div>
													</div>
												</AlertDescription>
											</Alert>
											<Button
												onClick={handleReturn}
												variant="outline"
												className="w-full h-12 text-lg"
											>
												Vrátiť knihu
											</Button>
										</motion.div>
									) : (
										<motion.div
											key="unavailable"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-center p-4 border border-dashed rounded-lg"
										>
											<AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
											<p className="text-muted-foreground">
												Kniha je momentálne nedostupná
											</p>
											<Button variant="ghost" size="sm" className="mt-2">
												<Heart className="mr-2 h-4 w-4" />
												Pridať do wishlistu
											</Button>
										</motion.div>
									)}
								</AnimatePresence>
							</CardContent>
						</Card>

						{/* Author Card */}
						{author && (
							<Card className="border-border/50">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										<User className="h-5 w-5" />
										Autor knihy
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-3 p-2 rounded-lg">
										<div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
											<User className="h-6 w-6 text-white" />
										</div>
										<div>
											<div className="font-medium">{author.name}</div>
											{author.nationality && (
												<div className="text-sm text-muted-foreground flex items-center gap-1">
													<Globe className="h-3 w-3" />
													{author.nationality}
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</motion.div>

					{/* Right Column - Book Details */}
					<motion.div
						className="lg:col-span-2 space-y-6"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<Card className="shadow-xl border-border/50">
							<CardHeader>
								<CardTitle className="text-3xl md:text-4xl">
									{book.title}
								</CardTitle>
								<CardDescription className="text-lg flex items-center gap-2">
									<User className="h-5 w-5" />
									<span className="hover:text-primary transition-colors">
										{book.authorName || book.author}
									</span>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-8">
								<div>
									<h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
										<BookOpen className="h-5 w-5" />
										Popis knihy
									</h3>
									<div className="prose prose-lg dark:prose-invert max-w-none">
										<p className="leading-relaxed text-muted-foreground">
											{book.description || "Popis nie je k dispozícii."}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<h4 className="font-semibold text-lg">
											Detailné informácie
										</h4>
										<div className="space-y-3">
											{book.isbn && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground">
														ISBN
													</span>
													<span className="font-mono">{book.isbn}</span>
												</div>
											)}
											{book.publishedYear && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														Rok vydania
													</span>
													<span>{book.publishedYear}</span>
												</div>
											)}
											{(book.categoryName || book.category) && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground">
														Kategória
													</span>
													<Badge
														variant="secondary"
														className="flex items-center gap-1"
													>
														<Tag className="h-3 w-3" />
														{book.categoryName || book.category}
													</Badge>
												</div>
											)}
										</div>
									</div>

									<div className="space-y-4">
										<h4 className="font-semibold text-lg">Technické údaje</h4>
										<div className="space-y-3">
											{book.language && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground">
														Jazyk
													</span>
													<span>{book.language}</span>
												</div>
											)}
											{book.publisher && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground">
														Vydavateľ
													</span>
													<span>{book.publisher}</span>
												</div>
											)}
											{book.pages && (
												<div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
													<span className="text-sm text-muted-foreground">
														Počet strán
													</span>
													<span>{book.pages}</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="shadow-xl border-border/50">
							<CardHeader>
								<CardTitle className="text-xl flex items-center gap-2">
									<Info className="h-5 w-5" />
									Podmienky požičania
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<span className="text-primary text-sm font-bold">
													1
												</span>
											</div>
											<div>
												<h4 className="font-medium mb-1">Výpožičná doba</h4>
												<p className="text-sm text-muted-foreground">
													30 dní s možnosťou predĺženia
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<span className="text-primary text-sm font-bold">
													2
												</span>
											</div>
											<div>
												<h4 className="font-medium mb-1">Limit kníh</h4>
												<p className="text-sm text-muted-foreground">
													Maximálne 5 kníh na čitateľa
												</p>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<span className="text-primary text-sm font-bold">
													3
												</span>
											</div>
											<div>
												<h4 className="font-medium mb-1">Predĺženie</h4>
												<p className="text-sm text-muted-foreground">
													Online alebo osobne v knižnici
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
												<span className="text-primary text-sm font-bold">
													4
												</span>
											</div>
											<div>
												<h4 className="font-medium mb-1">Omeškanie</h4>
												<p className="text-sm text-muted-foreground">
													Poplatok 0,50 € za každý deň omeškania
												</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Similar Books Section */}
						<Card className="shadow-xl border-border/50">
							<CardHeader>
								<CardTitle className="text-xl">Podobné knihy</CardTitle>
								<CardDescription>
									Ďalšie knihy z kategórie{" "}
									{book.categoryName || book.category || "fantasy"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{similarBooksData.map((similarBook) => (
										<Link
											key={similarBook.id}
											to="/books/$bookId"
											params={{ bookId: similarBook.id }}
											className="group"
										>
											<Card className="hover:shadow-lg transition-all duration-300 border-border/50">
												<CardContent className="p-4">
													<div className="flex items-center gap-4">
														<div className="w-16 h-24 bg-linear-to-br from-muted to-muted/50 rounded flex items-center justify-center shrink-0">
															<BookIcon className="h-8 w-8 text-muted-foreground" />
														</div>
														<div>
															<h4 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
																{similarBook.title}
															</h4>
															<p className="text-sm text-muted-foreground line-clamp-1">
																{similarBook.authorName}
															</p>
															<div className="flex items-center justify-between mt-2">
																<Badge variant="outline">
																	{similarBook.categoryName}
																</Badge>
																<Badge>
																	{similarBook.availableCopies > 0
																		? "Dostupné"
																		: "Vypožičané"}
																</Badge>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
