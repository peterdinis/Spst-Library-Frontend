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
	AlertCircle,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllBooks } from "../functions/getAllBooks";

// Typ pre knihu z API
interface Book {
	id: number | string;
	title: string;
	author?: string;
	description?: string;
	year?: number;
	category?: string;
	isAvailable?: boolean;
	// Ďalšie polia podľa vášho API
	publisher?: string;
	pages?: number;
	language?: string;
	photoPath?: string;
	addedToLibrary?: string;
}

const AllBooksWrapper: FC = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
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
		books.forEach(book => {
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

	// Loading state
	if (isLoading) {
		return (
			<section className="py-16 bg-linear-to-b from-background to-muted/30">
				<div className="container mx-auto px-4 text-center">
					<div className="flex flex-col items-center justify-center min-h-100">
						<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
						<h3 className="text-xl font-semibold mb-2">Načítavam knihy...</h3>
						<p className="text-muted-foreground">
							Prosím počkajte, kým sa načítajú údaje.
						</p>
					</div>
				</div>
			</section>
		);
	}

	// Error state
	if (isError) {
		return (
			<section className="py-16 bg-linear-to-b from-background to-muted/30">
				<div className="container mx-auto px-4 text-center">
					<div className="flex flex-col items-center justify-center min-h-100">
						<AlertCircle className="h-12 w-12 text-destructive mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Chyba pri načítaní kníh
						</h3>
						<p className="text-muted-foreground mb-4">
							{error instanceof Error ? error.message : "Neznáma chyba"}
						</p>
						<Button variant="outline" onClick={() => refetch()}>
							Skúsiť znova
						</Button>
					</div>
				</div>
			</section>
		);
	}

	// Empty state when no books
	if (books.length === 0 && !isLoading) {
		return (
			<section className="py-16 bg-gradient-to-b from-background to-muted/30">
				<div className="container mx-auto px-4 text-center">
					<div className="flex flex-col items-center justify-center min-h-[400px]">
						<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">Žiadne knihy</h3>
						<p className="text-muted-foreground">
							V knižnici sa momentálne nenachádzajú žiadne knihy.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 bg-gradient-to-b from-background to-muted/30">
			<div className="container mx-auto px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
						Knižný Katalóg
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Preskúmajte našu rozsiahlu zbierku kníh. Vyhľadávajte podľa názvu,
						autora alebo kategórie.
					</p>
				</motion.div>

				{/* Search and Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
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
							/>
							{searchTerm && (
								<button
									type="button"
									onClick={() => setSearchTerm("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
								>
									<X className="h-4 w-4" />
									Vymazať všetko
								</Button>
							)}
							<Button
								variant="outline"
								onClick={handleFilterToggle}
								className="flex items-center gap-2"
							>
								<Filter className="h-4 w-4" />
								Filtre {hasActiveFilters && "•"}
							</Button>
						</div>
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
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
						</div>
					</motion.div>
				)}

				{/* Books Grid */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					className="mb-12"
				>
					<AnimatePresence mode="wait">
						{filteredBooks.length > 0 ? (
							<motion.div
								key="books-grid"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
							>
								{filteredBooks.map((book) => (
									<motion.div
										key={book.id}
										variants={itemVariants}
										layout
										whileHover={{ y: -5, transition: { duration: 0.2 } }}
										onClick={() => navigate({ to: `/books/${book.id}` })}
										className="cursor-pointer"
									>
										<Card className="h-full hover:shadow-lg transition-shadow duration-300">
											<CardHeader className="pb-3">
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
											<CardContent className="pb-3">
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
							</motion.div>
						) : (
							<motion.div
								key="no-books"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="text-center py-12"
							>
								<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">
									Nenašli sa žiadne knihy
								</h3>
								<p className="text-muted-foreground mb-4">
									{hasActiveFilters
										? "Pre zadané kritériá sa nenašli žiadne výsledky."
										: "Skúste zmeniť vyhľadávací výraz alebo filtrovanie."}
								</p>
								{hasActiveFilters && (
									<Button variant="outline" onClick={clearFilters}>
										Vymazať všetky filtre
									</Button>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-center text-muted-foreground"
				>
					<p>
						Zobrazených {filteredBooks.length} z {books.length} kníh
						{hasActiveFilters && " (filtrovaných)"}
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default AllBooksWrapper;