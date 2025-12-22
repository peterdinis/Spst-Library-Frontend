"use client";

import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, BookOpen } from "lucide-react";

// Custom types
interface Book {
	id: string;
	title: string;
	author: string;
	description?: string;
	publishedYear?: number;
	categoryId: string;
	availableCopies: number;
	totalCopies: number;
	isAvailable?: boolean;
}

interface Category {
	id: string;
	name: string;
	description: string;
	color?: string;
	icon?: string;
}

// Mock data
const MOCK_BOOKS: Book[] = [
	{
		id: "1",
		title: "Veľký Gatsby",
		author: "F. Scott Fitzgerald",
		description:
			"Román o americkom sne, láske a spoločenskej triede v období jazzu.",
		publishedYear: 1925,
		categoryId: "1",
		availableCopies: 3,
		totalCopies: 5,
		isAvailable: true,
	},
	{
		id: "2",
		title: "Sto rokov samoty",
		author: "Gabriel García Márquez",
		description:
			"Magický realismus sledujúci históriu rodiny Buendía v meste Macondo.",
		publishedYear: 1967,
		categoryId: "2",
		availableCopies: 0,
		totalCopies: 3,
		isAvailable: false,
	},
	{
		id: "3",
		title: "Vražda v Oriente Expresse",
		author: "Agatha Christie",
		description:
			"Detektívny príbeh s Herculom Poirotom riešiacim vraždu v luxusnom vlaku.",
		publishedYear: 1934,
		categoryId: "3",
		availableCopies: 2,
		totalCopies: 4,
		isAvailable: true,
	},
	{
		id: "4",
		title: "1984",
		author: "George Orwell",
		description: "Dystopický román o totalitnom režime a dohliadaní.",
		publishedYear: 1949,
		categoryId: "4",
		availableCopies: 4,
		totalCopies: 6,
		isAvailable: true,
	},
	{
		id: "5",
		title: "Pán prsteňov",
		author: "J.R.R. Tolkien",
		description:
			"Fantasy epos o hobitovi Frodovi a jeho misii zničiť Jediný prsteň.",
		publishedYear: 1954,
		categoryId: "5",
		availableCopies: 1,
		totalCopies: 3,
		isAvailable: true,
	},
	{
		id: "6",
		title: "Malý princ",
		author: "Antoine de Saint-Exupéry",
		description: "Filozofický príbeh o priateľstve, láske a zmysle života.",
		publishedYear: 1943,
		categoryId: "6",
		availableCopies: 0,
		totalCopies: 2,
		isAvailable: false,
	},
	{
		id: "7",
		title: "Hra o tróny",
		author: "George R.R. Martin",
		description: "Prvý diel fantasy série Pieseň ľadu a ohňa.",
		publishedYear: 1996,
		categoryId: "5",
		availableCopies: 2,
		totalCopies: 5,
		isAvailable: true,
	},
	{
		id: "8",
		title: "Zločin a trest",
		author: "Fjodor Dostojevskij",
		description: "Psychologický román o študentovi, ktorý spácha vraždu.",
		publishedYear: 1866,
		categoryId: "1",
		availableCopies: 1,
		totalCopies: 2,
		isAvailable: true,
	},
];

const MOCK_CATEGORIES: Category[] = [
	{
		id: "1",
		name: "Román",
		description: "Klasické a moderné romány rôznych žánrov a tém.",
		color: "#3B82F6",
	},
	{
		id: "2",
		name: "Magický realismus",
		description: "Literatúra kombinujúca realitu s magickými prvkami.",
		color: "#8B5CF6",
	},
	{
		id: "3",
		name: "Detektívka",
		description: "Napínavé detektívne príbehy a kriminálne romány.",
		color: "#EF4444",
	},
	{
		id: "4",
		name: "Dystopia",
		description: "Romány o temných budúcnostiach a totalitných spoločnostiach.",
		color: "#6B7280",
	},
	{
		id: "5",
		name: "Fantasy",
		description: "Fantastické svety, čarodejníci, draci a hrdinské cesty.",
		color: "#10B981",
	},
	{
		id: "6",
		name: "Filozofia",
		description: "Filozofické diela a príbehy s hĺbkovým významom.",
		color: "#F59E0B",
	},
	{
		id: "7",
		name: "Biografia",
		description: "Životopisy významných osobností z rôznych oblastí.",
		color: "#EC4899",
	},
	{
		id: "8",
		name: "Veda a technika",
		description: "Odborná literatúra o vede, technike a inováciách.",
		color: "#14B8A6",
	},
];

const AllCategoriesWrapper: FC = () => {
	const navigate = useNavigate();
	const [categories, setCategories] = useState<Category[]>([]);
	const [books] = useState<Book[]>(MOCK_BOOKS);

	useEffect(() => {
		// Simulácia načítania dát
		const timer = setTimeout(() => {
			setCategories(MOCK_CATEGORIES);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	const getCategoryBookCount = (categoryId: string) => {
		return books.filter((book) => book.categoryId === categoryId).length;
	};

	const getCategoryColor = (categoryId: string) => {
		const category = MOCK_CATEGORIES.find((cat) => cat.id === categoryId);
		return category?.color || "#3B82F6";
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

	const availableBooksCount = books.filter((b) => b.availableCopies > 0).length;
	const totalBooksCount = books.length;

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
						Kategórie kníh
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Preskúmajte našu zbierku kníh podľa kategórií. Vyberte si z{" "}
						{categories.length} kategórií a {books.length} kníh.
					</p>
				</motion.div>

				{/* Categories Grid */}
				{categories.length === 0 ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
						<p className="text-muted-foreground">Načítavam kategórie...</p>
					</div>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
					>
						{categories.map((category) => {
							const bookCount = getCategoryBookCount(category.id);
							const categoryColor = getCategoryColor(category.id);

							return (
								<motion.div
									key={category.id}
									variants={itemVariants}
									whileHover={{
										y: -8,
										scale: 1.03,
										transition: { duration: 0.2 },
									}}
									onClick={() => navigate({ to: `/categories/${category.id}` })}
									className="cursor-pointer group"
								>
									<Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-primary/20">
										<CardHeader className="pb-4">
											<div className="flex items-start justify-between mb-3">
												<div
													className="p-3 rounded-xl shadow-sm"
													style={{
														backgroundColor: `${categoryColor}15`,
														border: `1px solid ${categoryColor}30`,
													}}
												>
													<Grid
														className="h-6 w-6"
														style={{ color: categoryColor }}
													/>
												</div>
												<Badge
													variant="secondary"
													className="font-semibold px-3 py-1"
												>
													{bookCount}{" "}
													{bookCount === 1
														? "kniha"
														: bookCount < 5
															? "knihy"
															: "kníh"}
												</Badge>
											</div>
											<CardTitle
												className="text-xl mb-2"
												style={{ color: categoryColor }}
											>
												{category.name}
											</CardTitle>
											<CardDescription className="text-sm line-clamp-3">
												{category.description}
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<BookOpen className="h-3.5 w-3.5" />
												<span>
													Kliknite pre zobrazenie kníh v tejto kategórii
												</span>
											</div>

											{bookCount > 0 && (
												<div className="mt-4 pt-3 border-t border-muted">
													<div className="text-xs text-muted-foreground">
														Dostupné knihy:{" "}
														<span className="font-medium text-foreground">
															{
																books.filter(
																	(b) =>
																		b.categoryId === category.id &&
																		b.availableCopies > 0,
																).length
															}
														</span>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</motion.div>
				)}

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="text-center mt-12"
				>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
						<div className="text-center p-4 bg-card rounded-xl shadow-sm border">
							<div className="text-3xl font-bold text-primary">
								{categories.length}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Kategórií
							</div>
						</div>
						<div className="text-center p-4 bg-card rounded-xl shadow-sm border">
							<div className="text-3xl font-bold text-green-600">
								{totalBooksCount}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Celkom kníh
							</div>
						</div>
						<div className="text-center p-4 bg-card rounded-xl shadow-sm border">
							<div className="text-3xl font-bold text-purple-600">
								{availableBooksCount}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Dostupných
							</div>
						</div>
						<div className="text-center p-4 bg-card rounded-xl shadow-sm border">
							<div className="text-3xl font-bold text-amber-600">
								{totalBooksCount - availableBooksCount}
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								Vypožičaných
							</div>
						</div>
					</div>

					{/* Additional Info */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="mt-8 p-4 bg-muted/30 rounded-lg max-w-lg mx-auto"
					>
						<p className="text-sm text-muted-foreground">
							Naša knižnica ponúka široký výber kníh z rôznych kategórií. Každá
							kategória obsahuje unikátne diela od renomovaných autorov.
						</p>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default AllCategoriesWrapper;
