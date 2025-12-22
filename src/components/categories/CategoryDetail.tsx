import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Book, TrendingUp, Clock, Award, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getCategoryDetail } from "@/functions/categories/getCategoryDetail";

interface CategoryDetailProps {
	categoryId: string;
}

interface CategoryStats {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	totalBooks: number;
	availableBooks: number;
	popularBooks: number;
	newBooks: number;
	mostBorrowedGenre: string;
	createdAt?: string;
	updatedAt?: string;
}

// Default icon mapping based on category name
const getDefaultIcon = (categoryName: string): string => {
	const iconMap: Record<string, string> = {
		"Román": "📖",
		"Fantasy": "🐉",
		"Detektívka": "🔍",
		"Dystopia": "🌆",
		"Magický realismus": "✨",
		"Filozofia": "💭",
		"Biografia": "👤",
		"Veda a technika": "🔬",
		"Horor": "👻",
		"Sci-fi": "🚀",
		"Poézia": "📜",
		"Drama": "🎭",
		"Učebnice": "📚",
		"Cestopisy": "✈️",
		"Kuchárky": "🍳",
		"Šport": "⚽",
		"Umenie": "🎨",
		"História": "🏛️",
		"Psychológia": "🧠",
		"Ekonomika": "💰",
	};
	
	return iconMap[categoryName] || "📚";
};

// Default color mapping based on category name
const getDefaultColor = (categoryName: string): string => {
	const colorMap: Record<string, string> = {
		"Román": "#3B82F6", // blue
		"Fantasy": "#10B981", // emerald
		"Detektívka": "#EF4444", // red
		"Dystopia": "#6B7280", // gray
		"Magický realismus": "#8B5CF6", // violet
		"Filozofia": "#F59E0B", // amber
		"Biografia": "#EC4899", // pink
		"Veda a technika": "#14B8A6", // teal
	};
	
	return colorMap[categoryName] || "#3B82F6"; // default blue
};

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
	categoryId,
}) => {
	// Use useQuery to fetch category details
	const {
		data: categoryResponse,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["category", categoryId],
		queryFn: async () => {
			if (!categoryId) throw new Error("Category ID is required");
			
			const response = await getCategoryDetail({ data: { categoryId } });
			
			// Check if the response was successful
			if (!response.success) {
				throw new Error(response.message || response.error || "Failed to fetch category");
			}
			
			// Transform data if needed
			const category = response.data;
			const icon = category.icon || getDefaultIcon(category.name);
			const color = category.color || getDefaultColor(category.name);
			
			// Get statistics from the API response or calculate defaults
			const totalBooks = category.totalBooks || category.bookCount || 0;
			const availableBooks = category.availableBooks || Math.floor(totalBooks * 0.7);
			const popularBooks = category.popularBooks || Math.floor(totalBooks * 0.2);
			const newBooks = category.newBooks || Math.floor(totalBooks * 0.1);
			const mostBorrowedGenre = category.mostBorrowedGenre || category.name;
			
			return {
				id: category.id?.toString() || categoryId,
				name: category.name || "Neznáma kategória",
				description: category.description || "Žiadny popis kategórie.",
				icon,
				color,
				totalBooks,
				availableBooks,
				popularBooks,
				newBooks,
				mostBorrowedGenre,
				// Include other properties that might be needed
				createdAt: category.createdAt,
				updatedAt: category.updatedAt,
			} as CategoryStats;
		},
		enabled: !!categoryId, // Only run the query if categoryId is provided
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
		retry: 2, // Retry twice
	});

	// Loading state
	if (isLoading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200"
			>
				<Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
				<h3 className="text-xl font-semibold mb-2">Načítavam kategóriu...</h3>
				<p className="text-muted-foreground">Prosím počkajte, kým sa načítajú údaje.</p>
			</motion.div>
		);
	}

	// Error state
	if (isError) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-8"
			>
				<Card>
					<CardContent className="p-8 text-center space-y-4">
						<AlertCircle className="h-16 w-16 text-destructive mx-auto" />
						<h2 className="text-2xl font-bold">Chyba pri načítaní kategórie</h2>
						<p className="text-muted-foreground">
							{error instanceof Error ? error.message : "Neznáma chyba"}
						</p>
						<div className="flex gap-3 justify-center mt-6">
							<button
								onClick={() => refetch()}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
							>
								Skúsiť znova
							</button>
							<button
								onClick={() => window.history.back()}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
							>
								Späť
							</button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	// Check if we have data
	if (!categoryResponse) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
					<CardContent className="p-8 text-center">
						<AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-2">Kategória nebola nájdená</h2>
						<p className="text-muted-foreground">
							Požadovaná kategória neexistuje alebo bola odstránená.
						</p>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	const {
		name,
		description,
		icon,
		totalBooks,
		availableBooks,
		popularBooks,
		newBooks,
		mostBorrowedGenre,
		color,
	} = categoryResponse;

	const stats = [
		{
			label: "Celkom kníh",
			value: totalBooks,
			icon: Book,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			label: "Dostupné",
			value: availableBooks,
			icon: TrendingUp,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			label: "Populárne",
			value: popularBooks,
			icon: Award,
			color: "text-yellow-600",
			bgColor: "bg-yellow-50",
		},
		{
			label: "Nové knihy",
			value: newBooks,
			icon: Clock,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
				<CardHeader>
					<div className="flex items-start gap-4">
						<motion.div
							className="text-5xl"
							whileHover={{ scale: 1.2, rotate: 10 }}
							transition={{ duration: 0.3 }}
							style={{ color }}
						>
							{icon}
						</motion.div>
						<div className="flex-1">
							<CardTitle className="text-3xl mb-2" style={{ color }}>
								{name}
							</CardTitle>
							<p className="text-gray-600 text-base leading-relaxed">
								{description}
							</p>
							{mostBorrowedGenre && (
								<motion.div
									className="mt-3"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									<Badge 
										variant="secondary" 
										className="text-sm"
										style={{ 
											backgroundColor: `${color}20`,
											color,
											borderColor: `${color}40`,
										}}
									>
										Najčítanejší žáner: {mostBorrowedGenre}
									</Badge>
								</motion.div>
							)}
							
							{/* Additional metadata if available */}
							<motion.div
								className="mt-4 pt-3 border-t border-gray-100"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								<div className="flex flex-wrap gap-3 text-xs text-gray-500">
									<span className="flex items-center gap-1">
										<Badge variant="outline" className="text-xs">
											ID: {categoryId}
										</Badge>
									</span>
									{categoryResponse.createdAt && (
										<span className="flex items-center gap-1">
											📅 Vytvorené: {new Date(categoryResponse.createdAt).toLocaleDateString('sk-SK')}
										</span>
									)}
								</div>
							</motion.div>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<motion.div
						className="grid grid-cols-2 md:grid-cols-4 gap-4"
						initial="hidden"
						animate="visible"
						variants={{
							hidden: { opacity: 0 },
							visible: {
								opacity: 1,
								transition: {
									staggerChildren: 0.1,
								},
							},
						}}
					>
						{stats.map((stat) => (
							<motion.div
								key={stat.label}
								variants={{
									hidden: { opacity: 0, y: 20 },
									visible: { opacity: 1, y: 0 },
								}}
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.2 }}
							>
								<Card className="border-none shadow-sm hover:shadow-md transition-shadow">
									<CardContent className="p-4">
										<div
											className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}
										>
											<stat.icon className={`h-6 w-6 ${stat.color}`} />
										</div>
										<div className="text-2xl font-bold text-gray-900 mb-1">
											{stat.value}
										</div>
										<div className="text-sm text-gray-600">{stat.label}</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
					
					{/* Additional stats or information could go here */}
					{totalBooks > 0 && (
						<motion.div
							className="mt-6 pt-4 border-t border-gray-100"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center p-3 bg-gray-50 rounded-lg">
									<div className="text-lg font-bold" style={{ color }}>
										{Math.round((availableBooks / totalBooks) * 100)}%
									</div>
									<div className="text-xs text-gray-600">Dostupnosť</div>
								</div>
								<div className="text-center p-3 bg-gray-50 rounded-lg">
									<div className="text-lg font-bold" style={{ color }}>
										{Math.round((popularBooks / totalBooks) * 100)}%
									</div>
									<div className="text-xs text-gray-600">Populárne</div>
								</div>
								<div className="text-center p-3 bg-gray-50 rounded-lg">
									<div className="text-lg font-bold" style={{ color }}>
										{Math.round((newBooks / totalBooks) * 100)}%
									</div>
									<div className="text-xs text-gray-600">Nové prídavky</div>
								</div>
							</div>
						</motion.div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
};