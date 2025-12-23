import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, User, BookOpen, MapPin, X, Loader2, RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authorsApi } from "@/api/authorsApi";

type Author = {
	authorId: number;
	firstName: string;
	lastName: string;
	biography?: string;
	email: string;
	dateOfBirth?: string;
	dateOfDeath?: string;
	country: string;
	website?: string;
	isActive: boolean;
	createdDate: string;
	lastModified: string;
	age?: number;
	status?: string;
	booksCount?: number;
	books?: Array<any>;
};

type TransformedAuthor = Author & {
	id: string;
	name: string;
	fullName: string;
	nationality: string;
	photoUrl: string;
};

export function AllAuthorsWrapper() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(6);
	const [nationalityFilter, setNationalityFilter] = useState<string>("all");

	// TanStack Query pre načítanie autorov
	const {
		data: authorsData,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching
	} = useQuery({
		queryKey: ['authors'],
		queryFn: async () => {
			const response = await authorsApi.getAllAuthors();
			return response;
		},
		retry: 3,
		retryDelay: 1000,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Transformácia dát
	const authors: TransformedAuthor[] = useMemo(() => {
		if (!authorsData) return [];
		
		return authorsData.map((author: Author) => ({
			...author,
			id: author.authorId.toString(),
			name: `${author.firstName} ${author.lastName}`,
			fullName: `${author.firstName} ${author.lastName}`,
			nationality: author.country,
			photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=random&size=128`
		}));
	}, [authorsData]);

	// Get unique nationalities for filter
	const nationalities = useMemo(() => {
		const uniqueNationalities = new Set(
			authors.map((author) => author.country).filter(Boolean),
		);
		return Array.from(uniqueNationalities).sort();
	}, [authors]);

	// Filter and search authors
	const filteredAuthors = useMemo(() => {
		return authors.filter((author) => {
			const matchesSearch =
				searchQuery === "" ||
				author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				author.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(author.biography && author.biography.toLowerCase().includes(searchQuery.toLowerCase()));

			const matchesNationality =
				nationalityFilter === "all" || author.country === nationalityFilter;

			return matchesSearch && matchesNationality;
		});
	}, [authors, searchQuery, nationalityFilter]);

	// Calculate pagination
	const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, nationalityFilter, itemsPerPage]);

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

	const handleSearchClear = () => {
		setSearchQuery("");
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleRefresh = () => {
		refetch();
	};

	const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48];

	if (isLoading) {
		return (
			<section className="py-16 bg-gradient-to-b from-background to-muted/30">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
						<h3 className="text-xl font-semibold mb-2">Načítavanie autorov...</h3>
						<p className="text-muted-foreground">Prosím čakajte</p>
					</div>
				</div>
			</section>
		);
	}

	if (isError) {
		const errorMessage = error instanceof Error ? error.message : "Nastala neznáma chyba";
		return (
			<section className="py-16 bg-gradient-to-b from-background to-muted/30">
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
					<div className="flex justify-between items-center mb-4">
						<div className="flex-1"></div>
						<div className="flex-1 text-center">
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
								Naši autori
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
						Spoznajte autorov kníh v našej knižnici
					</p>
				</motion.div>

				{/* Search and Filter Controls */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mb-8"
				>
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search Input */}
						<div className="relative w-full md:w-96">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								type="text"
								placeholder="Hľadať autorov podľa mena alebo životopisu..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10"
							/>
							{searchQuery && (
								<button
									onClick={handleSearchClear}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
									disabled={isRefetching}
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>

						{/* Filter and Items Per Page */}
						<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
							{/* Nationality Filter */}
							<Select
								value={nationalityFilter}
								onValueChange={setNationalityFilter}
								disabled={isRefetching}
							>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue placeholder="Všetky národnosti" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Všetky národnosti</SelectItem>
									{nationalities.map((nationality) => (
										<SelectItem key={nationality} value={nationality!}>
											{nationality}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Items Per Page */}
							<Select
								value={itemsPerPage.toString()}
								onValueChange={(value) => setItemsPerPage(parseInt(value))}
								disabled={isRefetching}
							>
								<SelectTrigger className="w-full sm:w-32">
									<SelectValue placeholder="Počet na stranu" />
								</SelectTrigger>
								<SelectContent>
									{ITEMS_PER_PAGE_OPTIONS.map((option) => (
										<SelectItem key={option} value={option.toString()}>
											{option} / strana
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Results Count */}
					<div className="mt-4 text-sm text-muted-foreground">
						{isRefetching ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-3 w-3 animate-spin" />
								Aktualizácia dát...
							</div>
						) : filteredAuthors.length === 0 ? (
							"Nenašli sa žiadni autori"
						) : (
							<>
								Nájdených {filteredAuthors.length}{" "}
								{filteredAuthors.length === 1
									? "autor"
									: filteredAuthors.length >= 2 && filteredAuthors.length <= 4
										? "autori"
										: "autorov"}
								{searchQuery && ` pre "${searchQuery}"`}
								{nationalityFilter !== "all" && ` (${nationalityFilter})`}
							</>
						)}
					</div>
				</motion.div>

				{/* Authors Grid */}
				{filteredAuthors.length > 0 ? (
					<>
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						>
							{paginatedAuthors.map((author) => (
								<motion.div
									key={author.id}
									variants={itemVariants}
									whileHover={{ y: -5, scale: 1.02 }}
									transition={{ duration: 0.2 }}
									className="cursor-pointer"
								>
									<Link
										to="/authors/$authorId"
										params={{ authorId: author.id }}
										className="block"
									>
										<Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50">
											<CardHeader>
												<div className="flex items-start gap-4 mb-3">
													<img
														src={author.photoUrl}
														alt={author.name}
														className="w-16 h-16 rounded-full object-cover ring-2 ring-muted"
														loading="lazy"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.onerror = null;
															target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=6b7280&color=fff&size=128`;
														}}
													/>
													<div className="flex-1">
														<CardTitle className="text-xl mb-1">
															{author.name}
														</CardTitle>
														{author.country && (
															<div className="flex items-center gap-1 text-sm text-muted-foreground">
																<MapPin className="h-3 w-3" />
																{author.country}
															</div>
														)}
													</div>
												</div>
												<CardDescription className="line-clamp-3">
													{author.biography || "Životopis nie je k dispozícii"}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2 text-sm">
														<BookOpen className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															{author.booksCount || 0}{" "}
															{(author.booksCount || 0) === 1
																? "kniha"
																: (author.booksCount || 0) >= 2 &&
																		(author.booksCount || 0) <= 4
																	? "knihy"
																	: "kníh"}
														</span>
													</div>
													<Badge variant="secondary" className="font-normal">
														Zobraziť profil
													</Badge>
												</div>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							))}
						</motion.div>

						{/* Pagination */}
						{totalPages > 1 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.3 }}
								className="mt-8"
							>
								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() =>
													handlePageChange(Math.max(1, currentPage - 1))
												}
												className={
													currentPage === 1
														? "pointer-events-none opacity-50"
														: "cursor-pointer"
												}
												disabled={isRefetching}
											/>
										</PaginationItem>

										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter((page) => {
												// Show first, last, current, and pages around current
												if (totalPages <= 7) return true;
												if (page === 1 || page === totalPages) return true;
												if (Math.abs(page - currentPage) <= 1) return true;
												return false;
											})
											.map((page, index, array) => {
												// Add ellipsis for gaps
												const showEllipsis =
													index > 0 && page - array[index - 1] > 1;
												return (
													<div key={page} className="flex items-center">
														{showEllipsis && (
															<span className="px-2 text-muted-foreground">
																...
															</span>
														)}
														<PaginationItem>
															<PaginationLink
																onClick={() => handlePageChange(page)}
																isActive={currentPage === page}
																className="cursor-pointer"
																disabled={isRefetching}
															>
																{page}
															</PaginationLink>
														</PaginationItem>
													</div>
												);
											})}

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													handlePageChange(
														Math.min(totalPages, currentPage + 1),
													)
												}
												className={
													currentPage === totalPages
														? "pointer-events-none opacity-50"
														: "cursor-pointer"
												}
												disabled={isRefetching}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>

								{/* Page Info */}
								<div className="text-center text-sm text-muted-foreground mt-4">
									Strana {currentPage} z {totalPages} • Zobrazené{" "}
									{startIndex + 1}-{Math.min(endIndex, filteredAuthors.length)}{" "}
									z {filteredAuthors.length} autorov
								</div>
							</motion.div>
						)}
					</>
				) : (
					// No Results State
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center py-12"
					>
						<div className="mx-auto max-w-md">
							<div className="rounded-full bg-muted p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
								<Search className="h-12 w-12 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Nenašli sa žiadni autori
							</h3>
							<p className="text-muted-foreground mb-6">
								Skúste zmeniť kritériá vyhľadávania alebo vymazať filtre
							</p>
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery("");
									setNationalityFilter("all");
								}}
								disabled={isRefetching}
							>
								<X className="mr-2 h-4 w-4" />
								Vymazať všetky filtre
							</Button>
						</div>
					</motion.div>
				)}

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="text-center mt-12"
				>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto">
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-primary">
								{authors.length}
							</div>
							<div className="text-sm text-muted-foreground">
								Celkom autorov
							</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-green-600">
								{authors.reduce((sum, author) => sum + (author.booksCount || 0), 0)}
							</div>
							<div className="text-sm text-muted-foreground">Celkom kníh</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-purple-600">
								{new Set(authors.map(a => a.country)).size}
							</div>
							<div className="text-sm text-muted-foreground">Krajín</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}