"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Search,
	BookOpen,
	User,
	Calendar,
	Filter,
	X,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "../../functions/books/getAllBooks";

const AllBooksWrapper: FC = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [, setCurrentPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [availability, setAvailability] = useState<string>("all");

	// Použitie useQuery na získanie dát zo server funkcie
	const {
		data: books = [],
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["books"],
		queryFn: async () => {
			const result = await getAllBooks();
			// Transformácia dát podľa potreby
			return Array.isArray(result)
				? result.map((book: any) => ({
						id: book.id?.toString() || "",
						title: book.title || "",
						author: book.author,
						description: book.description,
						publishedYear: book.year,
						category: book.category,
						isAvailable: book.isAvailable,
						publisher: book.publisher,
						pages: book.pages,
						language: book.language,
						photoPath: book.photoPath,
						addedToLibrary: book.addedToLibrary,
					}))
				: [];
		},
		retry: 3,
		retryDelay: 1000,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Memoizované filtrovanie pre lepšiu výkonnosť
	const filteredBooks = useMemo(() => {
		return books.filter((book) => {
			// Vyhľadávanie
			const matchesSearch =
				searchTerm === "" ||
				book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				book.description?.toLowerCase().includes(searchTerm.toLowerCase());

			// Filtrovanie podľa kategórie
			const matchesCategory =
				selectedCategory === "all" || book.category === selectedCategory;

			// Filtrovanie podľa dostupnosti
			const matchesAvailability =
				availability === "all" ||
				(availability === "available" && book.isAvailable) ||
				(availability === "unavailable" && !book.isAvailable);

			return matchesSearch && matchesCategory && matchesAvailability;
		});
	}, [books, searchTerm, selectedCategory, availability]);

	// Dynamické kategórie z API dát
	const categories = useMemo(() => {
		const categorySet = new Set<string>();
		books.forEach((book) => {
			if (book.category) {
				categorySet.add(book.category);
			}
		});
		return Array.from(categorySet).sort();
	}, [books]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleFilterToggle = () => {
		setShowFilters(!showFilters);
	};

	const clearFilters = () => {
		setSelectedCategory("all");
		setAvailability("all");
		setSearchTerm("");
		setCurrentPage(1);
		setShowFilters(false);
	};

	const hasActiveFilters =
		selectedCategory !== "all" || availability !== "all" || searchTerm !== "";

	// Zatváranie filtrov pri zmene filterov
	useEffect(() => {
		if (selectedCategory !== "all" || availability !== "all") {
			setShowFilters(true);
		}
	}, [selectedCategory, availability]);

	const handleRefresh = () => {
		refetch();
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	// Loading state - Rovnaký ako pri spisovateľoch
	if (isLoading) {
		return (
			<section className="py-16 bg-linear-to-b from-background to-muted/30">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
						<h3 className="text-xl font-semibold mb-2">Načítavanie kníh...</h3>
						<p className="text-muted-foreground">Prosím čakajte</p>
					</div>
				</div>
			</section>
		);
	}

	// Error state - Rovnaký ako pri spisovateľoch
	if (isError) {
		const errorMessage = error instanceof Error ? error.message : "Nastala neznáma chyba";
		return (
			<section className="py-16 bg-linear-to-b from-background to-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center py-12">
						<div className="mx-auto max-w-md">
							<div className="rounded-full bg-destructive/10 p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
								<X className="h-12 w-12 text-destructive" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Chyba pri načítavaní</h3>
							<p className="text-muted-foreground mb-6">{errorMessage}</p>
							<Button onClick={handleRefresh}>
								<RefreshCw className="mr-2 h-4 w-4" />
								Skúsiť znova
							</Button>
						</div>
					</div>
				</div>
			</section>
		);
	}

	// Empty state when no books
	if (books.length === 0 && !isLoading) {
		return (
			<section className="py-16 bg-linear-to-b from-background to-muted/30">
				<div className="container mx-auto px-4">
					{/* Header - Rovnaký štýl ako pri spisovateľoch */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<div className="flex justify-between items-center mb-4">
							<div className="flex-1"></div>
							<div className="flex-1 text-center">
								<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
									Knižný Katalóg
								</h1>
							</div>
							<div className="flex-1 flex justify-end">
								<Button
									variant="outline"
									size="icon"
									onClick={handleRefresh}
									disabled={isRefetching}
									className="relative"
								>
									<RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
									{isRefetching && (
										<span className="absolute -top-1 -right-1 h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
											<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
										</span>
									)}
								</Button>
							</div>
						</div>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Preskúmajte našu rozsiahlu zbierku kníh. Vyhľadávajte podľa názvu,
							autora alebo kategórie.
						</p>
					</motion.div>

					{/* Empty state - Rovnaký štýl ako pri spisovateľoch */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center py-12"
					>
						<div className="mx-auto max-w-md">
							<div className="rounded-full bg-muted p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
								<BookOpen className="h-12 w-12 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Žiadne knihy
							</h3>
							<p className="text-muted-foreground mb-6">
								V knižnici sa momentálne nenachádzajú žiadne knihy.
							</p>
							<Button
								variant="outline"
								onClick={handleRefresh}
								disabled={isRefetching}
							>
								<RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
								Skúsiť znova
							</Button>
						</div>
					</motion.div>

					{/* Stats - Rovnaký štýl ako pri spisovateľoch */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="text-center mt-12"
					>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto">
							<div className="text-center p-4 rounded-lg border bg-card">
								<div className="text-2xl font-bold text-primary">
									0
								</div>
								<div className="text-sm text-muted-foreground">
									Celkom kníh
								</div>
							</div>
							<div className="text-center p-4 rounded-lg border bg-card">
								<div className="text-2xl font-bold text-green-600">
									0
								</div>
								<div className="text-sm text-muted-foreground">Dostupných kníh</div>
							</div>
							<div className="text-center p-4 rounded-lg border bg-card">
								<div className="text-2xl font-bold text-purple-600">
									0
								</div>
								<div className="text-sm text-muted-foreground">Kategórií</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-linear-to-b from-background to-muted/30">
			<div className="container mx-auto px-4">
				{/* Header - Rovnaký štýl ako pri spisovateľoch */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<div className="flex justify-between items-center mb-4">
						<div className="flex-1"></div>
						<div className="flex-1 text-center">
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
								Knižný Katalóg
							</h1>
						</div>
						<div className="flex-1 flex justify-end">
							<Button
								variant="outline"
								size="icon"
								onClick={handleRefresh}
								disabled={isRefetching}
								className="relative"
							>
								<RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
								{isRefetching && (
									<span className="absolute -top-1 -right-1 h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
									</span>
								)}
							</Button>
						</div>
					</div>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Preskúmajte našu rozsiahlu zbierku kníh. Vyhľadávajte podľa názvu,
						autora alebo kategórie.
					</p>
				</motion.div>

				{/* Search and Filter Controls */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mb-8"
				>
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
						<div className="relative w-full sm:w-96">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								type="text"
								placeholder="Hľadať knihy, autorov, kategórie..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-10 pr-4 py-2 w-full"
								disabled={isRefetching}
							/>
							{searchTerm && (
								<button
									type="button"
									onClick={() => setSearchTerm("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
									disabled={isRefetching}
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
						<div className="flex gap-2">
							{hasActiveFilters && (
								<Button
									variant="outline"
									onClick={clearFilters}
									className="flex items-center gap-2"
									disabled={isRefetching}
								>
									<X className="h-4 w-4" />
									Vymazať všetko
								</Button>
							)}
							<Button
								variant="outline"
								onClick={handleFilterToggle}
								className="flex items-center gap-2"
								disabled={isRefetching}
							>
								<Filter className="h-4 w-4" />
								Filtre {hasActiveFilters && "•"}
							</Button>
						</div>
					</div>

					{/* Results Count - Rovnaký štýl ako pri spisovateľoch */}
					<div className="mt-4 text-sm text-muted-foreground">
						{isRefetching ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-3 w-3 animate-spin" />
								Aktualizácia dát...
							</div>
						) : filteredBooks.length === 0 ? (
							"Nenašli sa žiadne knihy"
						) : (
							<>
								Nájdených {filteredBooks.length}{" "}
								{filteredBooks.length === 1
									? "kniha"
									: filteredBooks.length >= 2 && filteredBooks.length <= 4
										? "knihy"
										: "kníh"}
								{searchTerm && ` pre "${searchTerm}"`}
							</>
						)}
					</div>

					{/* Filters Panel */}
					<AnimatePresence>
						{showFilters && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 p-4 bg-card border rounded-lg"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-2">
											Kategória
										</label>
										<select
											value={selectedCategory}
											onChange={(e) => setSelectedCategory(e.target.value)}
											className="w-full p-2 border rounded-md"
											disabled={isRefetching}
										>
											<option value="all">Všetky kategórie</option>
											{categories.map((category) => (
												<option key={category} value={category}>
													{category}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">
											Dostupnosť
										</label>
										<select
											value={availability}
											onChange={(e) => setAvailability(e.target.value)}
											className="w-full p-2 border rounded-md"
											disabled={isRefetching}
										>
											<option value="all">Všetky</option>
											<option value="available">Dostupné</option>
											<option value="unavailable">Vypožičané</option>
										</select>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Active Filters Info */}
				{hasActiveFilters && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 p-3 bg-muted/50 rounded-lg"
					>
						<div className="flex flex-wrap items-center gap-2 text-sm">
							<span className="font-medium">Aktívne filtre:</span>
							{searchTerm && (
								<span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
									Vyhľadávanie: "{searchTerm}"
									<button
										onClick={() => setSearchTerm("")}
										className="ml-1 hover:text-primary/70"
										disabled={isRefetching}
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
							{selectedCategory !== "all" && (
								<span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
									Kategória: {selectedCategory}
									<button
										onClick={() => setSelectedCategory("all")}
										className="ml-1 hover:text-primary/70"
										disabled={isRefetching}
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
							{availability !== "all" && (
								<span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
									Dostupnosť:{" "}
									{availability === "available" ? "Dostupné" : "Vypožičané"}
									<button
										onClick={() => setAvailability("all")}
										className="ml-1 hover:text-primary/70"
										disabled={isRefetching}
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
						</div>
					</motion.div>
				)}

				{/* Books Grid */}
				<AnimatePresence mode="wait">
					{filteredBooks.length > 0 ? (
						<motion.div
							key="books-grid"
							variants={containerVariants}
							initial="hidden"
							whileInView="visible"
							className="mb-12"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredBooks.map((book) => (
									<motion.div
										key={book.id}
										variants={itemVariants}
										layout
										whileHover={{ y: -5, scale: 1.02 }}
										transition={{ duration: 0.2 }}
										onClick={() => navigate({ to: `/books/${book.id}` })}
										className="cursor-pointer"
									>
										<Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50">
											<CardHeader>
												<CardTitle className="text-xl line-clamp-2">
													{book.title}
												</CardTitle>
												<CardDescription className="flex items-center gap-2 mt-2">
													<User className="h-4 w-4" />
													{book.author || "Neznámy autor"}
												</CardDescription>
												{book.category && (
													<div className="mt-2">
														<span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
															{book.category}
														</span>
														<span
															className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
																book.isAvailable
																	? "bg-green-100 text-green-800"
																	: "bg-red-100 text-red-800"
															}`}
														>
															{book.isAvailable ? "Dostupné" : "Vypožičané"}
														</span>
													</div>
												)}
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground line-clamp-3">
													{book.description || "Žiadny popis."}
												</p>
												<div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
													{book.publishedYear && (
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															Rok: {book.publishedYear}
														</div>
													)}
													{book.publisher && (
														<div className="flex items-center gap-1">
															Vydavateľ: {book.publisher}
														</div>
													)}
													{book.pages && (
														<div className="flex items-center gap-1">
															Strany: {book.pages}
														</div>
													)}
													{book.language && (
														<div className="flex items-center gap-1">
															Jazyk: {book.language}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>
						</motion.div>
					) : (
						// No Results State - Rovnaký štýl ako pri spisovateľoch
						<motion.div
							key="no-books"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="text-center py-12"
						>
							<div className="mx-auto max-w-md">
								<div className="rounded-full bg-muted p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
									<Search className="h-12 w-12 text-muted-foreground" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									Nenašli sa žiadne knihy
								</h3>
								<p className="text-muted-foreground mb-6">
									Skúste zmeniť kritériá vyhľadávania alebo vymazať filtre
								</p>
								<Button
									variant="outline"
									onClick={() => {
										setSearchTerm("");
										setSelectedCategory("all");
										setAvailability("all");
									}}
									disabled={isRefetching}
								>
									<X className="mr-2 h-4 w-4" />
									Vymazať všetky filtre
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Stats - Rovnaký štýl ako pri spisovateľoch */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="text-center mt-12"
				>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto">
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-primary">
								{books.length}
							</div>
							<div className="text-sm text-muted-foreground">
								Celkom kníh
							</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-green-600">
								{books.filter(book => book.isAvailable).length}
							</div>
							<div className="text-sm text-muted-foreground">Dostupných kníh</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-purple-600">
								{categories.length}
							</div>
							<div className="text-sm text-muted-foreground">Kategórií</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default AllBooksWrapper;