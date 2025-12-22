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
import { Search, User, BookOpen, MapPin, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

type Author = {
	id: string;
	name: string;
	biography: string;
	photoUrl?: string;
	nationality?: string;
};

type Book = {
	id: string;
	title: string;
	authorId: string;
	authorName: string;
	categoryName: string;
	isbn: string;
	publishedYear: number;
	availableCopies: number;
	totalCopies: number;
	coverUrl?: string;
	description?: string;
};

// Mock data defined directly in the component file
const mockAuthors: Author[] = [
	{
		id: "1",
		name: "J.K. Rowling",
		biography:
			"Britská spisovateľka, známa predovšetkým ako autorka série románov o Harry Potterovi. Jej knihy sa predali v miliónoch kópií po celom svete a boli adaptované do filmovej podoby.",
		photoUrl:
			"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop&crop=face",
		nationality: "Britská",
	},
	{
		id: "2",
		name: "George Orwell",
		biography:
			"Britský spisovateľ a novinár, známy svojimi dielami 1984 a Farmou zvierat. Jeho diela sú kritikou totalitných režimov a sociálnych problémov.",
		photoUrl:
			"https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop&crop=face",
		nationality: "Britská",
	},
	{
		id: "3",
		name: "Stephen King",
		biography:
			"Americký spisovateľ hororov, sci-fi a fantasy, autor viac ako 60 románov. Je považovaný za kráľa hororu a jeho knihy boli sfilmované v mnohých filmových adaptáciách.",
		photoUrl:
			"https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=400&fit=crop&crop=face",
		nationality: "Americká",
	},
	{
		id: "4",
		name: "Agatha Christie",
		biography:
			"Britská spisovateľka detektívnych románov, najpredávanejšia autorka všetkých čias. Je známa svojimi príbehmi o Herkulovi Poirotovi a Miss Marple.",
		photoUrl:
			"https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop&crop=face",
		nationality: "Britská",
	},
	{
		id: "5",
		name: "Ernest Hemingway",
		biography:
			"Americký spisovateľ a novinár, nositeľ Nobelovej ceny za literatúru z roku 1954. Jeho minimalistický štýl a témy mužskej odvahy ovplyvnili celú generáciu spisovateľov.",
		photoUrl:
			"https://images.unsplash.com/photo-1567534296755-58d0d2c7d336?w=400&h=400&fit=crop&crop=face",
		nationality: "Americká",
	},
	{
		id: "6",
		name: "Milan Kundera",
		biography:
			"Český a francúzsky spisovateľ, známy svojim dielom Nesnesiteľná ľahkosť bytia. Jeho tvorba sa zaoberá filozofickými otázkami ľudskej existencie a lásky.",
		photoUrl:
			"https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
		nationality: "Česká/Francúzska",
	},
	{
		id: "7",
		name: "Pavol Dobšinský",
		biography:
			"Slovenský spisovateľ, básnik a zberateľ ľudových rozprávok. Významne prispel k zachovaniu slovenskej ľudovej slovesnosti.",
		photoUrl:
			"https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=400&h=400&fit=crop&crop=face",
		nationality: "Slovenská",
	},
	{
		id: "8",
		name: "Margita Figuli",
		biography:
			"Slovenská spisovateľka, autorka románov a poviedok pre deti a mládež. Jej dielo Tri gaštanové kone je klasikou slovenskej literatúry.",
		nationality: "Slovenská",
	},
	{
		id: "9",
		name: "Ján Hollý",
		biography:
			"Slovenský básnik a prekladateľ, jeden z najvýznamnejších predstaviteľov slovenského klasicizmu. Prekladal antickú literatúru do slovenčiny.",
		nationality: "Slovenská",
	},
	{
		id: "10",
		name: "William Shakespeare",
		biography:
			"Anglický dramatik a básnik, považovaný za najvýznamnejšieho spisovateľa v anglickom jazyku. Autor diel ako Romeo a Júlia, Hamlet a Macbeth.",
		photoUrl:
			"https://images.unsplash.com/photo-1561297101-0a65d4fca7ac?w=400&h=400&fit=crop&crop=face",
		nationality: "Anglická",
	},
	{
		id: "11",
		name: "František Švantner",
		biography:
			"Slovenský spisovateľ, predstaviteľ naturalizmu v slovenskej literatúre. Autor románu Malka a iných diel.",
		nationality: "Slovenská",
	},
	{
		id: "12",
		name: "Taras Ševčenko",
		biography:
			"Ukrajinský básnik, maliar a humanista, národný buditeľ Ukrajiny. Autor zbierky básní Kobzar.",
		photoUrl:
			"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
		nationality: "Ukrajinská",
	},
];

const mockBooks: Book[] = [
	{
		id: "1",
		title: "Harry Potter a Kameň mudrcov",
		authorId: "1",
		authorName: "J.K. Rowling",
		categoryName: "Fantasy",
		isbn: "9788020415628",
		publishedYear: 1997,
		availableCopies: 3,
		totalCopies: 5,
	},
	{
		id: "2",
		title: "1984",
		authorId: "2",
		authorName: "George Orwell",
		categoryName: "Dystopia",
		isbn: "9780451524935",
		publishedYear: 1949,
		availableCopies: 2,
		totalCopies: 4,
	},
	{
		id: "3",
		title: "To",
		authorId: "3",
		authorName: "Stephen King",
		categoryName: "Horor",
		isbn: "9780450411434",
		publishedYear: 1986,
		availableCopies: 1,
		totalCopies: 3,
	},
	{
		id: "4",
		title: "Vražda v Orient exprese",
		authorId: "4",
		authorName: "Agatha Christie",
		categoryName: "Detektívka",
		isbn: "9780007119318",
		publishedYear: 1934,
		availableCopies: 4,
		totalCopies: 6,
	},
	{
		id: "5",
		title: "Starca a more",
		authorId: "5",
		authorName: "Ernest Hemingway",
		categoryName: "Literatúra faktu",
		isbn: "9780684801223",
		publishedYear: 1952,
		availableCopies: 2,
		totalCopies: 3,
	},
	{
		id: "6",
		title: "Nesnesiteľná ľahkosť bytia",
		authorId: "6",
		authorName: "Milan Kundera",
		categoryName: "Filozofický román",
		isbn: "9788020412344",
		publishedYear: 1984,
		availableCopies: 2,
		totalCopies: 3,
	},
	{
		id: "7",
		title: "Tri gaštanové kone",
		authorId: "8",
		authorName: "Margita Figuli",
		categoryName: "Román",
		isbn: "9788080781234",
		publishedYear: 1940,
		availableCopies: 5,
		totalCopies: 8,
	},
	{
		id: "8",
		title: "Babylon",
		authorId: "7",
		authorName: "Pavol Dobšinský",
		categoryName: "Ľudové rozprávky",
		isbn: "9788080785678",
		publishedYear: 1880,
		availableCopies: 3,
		totalCopies: 5,
	},
	{
		id: "9",
		title: "Svätojánske ohne",
		authorId: "9",
		authorName: "Ján Hollý",
		categoryName: "Poezia",
		isbn: "9788080789010",
		publishedYear: 1835,
		availableCopies: 4,
		totalCopies: 6,
	},
	{
		id: "10",
		title: "Harry Potter a Tajomná komnata",
		authorId: "1",
		authorName: "J.K. Rowling",
		categoryName: "Fantasy",
		isbn: "9788020415635",
		publishedYear: 1998,
		availableCopies: 2,
		totalCopies: 4,
	},
	{
		id: "11",
		title: "Farma zvierat",
		authorId: "2",
		authorName: "George Orwell",
		categoryName: "Satira",
		isbn: "9780451526342",
		publishedYear: 1945,
		availableCopies: 3,
		totalCopies: 5,
	},
	{
		id: "12",
		title: "Carrie",
		authorId: "3",
		authorName: "Stephen King",
		categoryName: "Horor",
		isbn: "9780451169532",
		publishedYear: 1974,
		availableCopies: 1,
		totalCopies: 3,
	},
];

const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48];

export function AllAuthorsWrapper() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(6);
	const [nationalityFilter, setNationalityFilter] = useState<string>("all");

	const getAuthorBookCount = (authorId: string) => {
		return mockBooks.filter((book) => book.authorId === authorId).length;
	};

	// Get unique nationalities for filter
	const nationalities = useMemo(() => {
		const uniqueNationalities = new Set(
			mockAuthors.map((author) => author.nationality).filter(Boolean),
		);
		return Array.from(uniqueNationalities).sort();
	}, []);

	// Filter and search authors
	const filteredAuthors = useMemo(() => {
		return mockAuthors.filter((author) => {
			const matchesSearch =
				searchQuery === "" ||
				author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				author.biography.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesNationality =
				nationalityFilter === "all" || author.nationality === nationalityFilter;

			return matchesSearch && matchesNationality;
		});
	}, [searchQuery, nationalityFilter]);

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
						Naši autori
					</h1>
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
						{filteredAuthors.length === 0 ? (
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
													{author.photoUrl ? (
														<img
															src={author.photoUrl}
															alt={author.name}
															className="w-16 h-16 rounded-full object-cover ring-2 ring-muted"
															loading="lazy"
														/>
													) : (
														<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ring-2 ring-muted">
															<User className="h-8 w-8 text-white" />
														</div>
													)}
													<div className="flex-1">
														<CardTitle className="text-xl mb-1">
															{author.name}
														</CardTitle>
														{author.nationality && (
															<div className="flex items-center gap-1 text-sm text-muted-foreground">
																<MapPin className="h-3 w-3" />
																{author.nationality}
															</div>
														)}
													</div>
												</div>
												<CardDescription className="line-clamp-3">
													{author.biography}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2 text-sm">
														<BookOpen className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															{getAuthorBookCount(author.id)}{" "}
															{getAuthorBookCount(author.id) === 1
																? "kniha"
																: getAuthorBookCount(author.id) >= 2 &&
																		getAuthorBookCount(author.id) <= 4
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
								{mockAuthors.length}
							</div>
							<div className="text-sm text-muted-foreground">
								Celkom autorov
							</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-green-600">
								{mockBooks.length}
							</div>
							<div className="text-sm text-muted-foreground">Celkom kníh</div>
						</div>
						<div className="text-center p-4 rounded-lg border bg-card">
							<div className="text-2xl font-bold text-purple-600">
								{new Set(mockBooks.map((b) => b.categoryName)).size}
							</div>
							<div className="text-sm text-muted-foreground">Kategórií</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
