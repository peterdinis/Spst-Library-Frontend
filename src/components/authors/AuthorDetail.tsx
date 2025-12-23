import React from "react";
import { Book, Award, Calendar, Globe, TrendingUp, Users, Loader2, X, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getAuthorDetail } from "@/functions/authors/getAuthorByDetail";

interface AuthorDetailData {
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
}

interface AuthorDetailProps {
	authorId?: string;
	onRefresh?: () => void;
}

export const AuthorDetail: React.FC<AuthorDetailProps> = ({
	authorId: propAuthorId,
	onRefresh,
}) => {
	// Použitie authorId z props alebo z URL parametra
	const params = useParams({ from: "/authors/$authorId" });
	const authorId = propAuthorId || params.authorId;

	// TanStack Query pre načítanie detailov autora
	const {
		data: authorData,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching
	} = useQuery({
		queryKey: ['author', authorId],
		queryFn: async () => {
			if (!authorId) {
				throw new Error("Author ID is required");
			}
			
			const result = await getAuthorDetail({ data: {
				authorId
			}});
			
			if (!result.success || !result.data) {
				throw new Error(result.error || "Failed to fetch author details");
			}
			
			return result.data;
		},
		enabled: !!authorId,
		retry: 3,
		retryDelay: 1000,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const handleRefresh = () => {
		if (onRefresh) {
			onRefresh();
		} else {
			refetch();
		}
	};

	if (!authorId) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center py-12"
			>
				<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
					<CardContent className="py-12">
						<div className="mx-auto max-w-md">
							<div className="rounded-full bg-muted p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
								<X className="h-12 w-12 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Chýba ID autora</h3>
							<p className="text-muted-foreground">
								Pre zobrazenie detailov autora je potrebné špecifikovať ID autora.
							</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (isLoading) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center py-12"
			>
				<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
					<CardContent className="py-12">
						<div className="flex flex-col items-center justify-center">
							<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
							<h3 className="text-xl font-semibold mb-2">Načítavanie detailov autora...</h3>
							<p className="text-muted-foreground">Prosím čakajte</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (isError || !authorData) {
		const errorMessage = error instanceof Error ? error.message : "Nastala neznáma chyba";
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center py-12"
			>
				<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
					<CardContent className="py-12">
						<div className="mx-auto max-w-md">
							<div className="rounded-full bg-destructive/10 p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
								<X className="h-12 w-12 text-destructive" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Chyba pri načítavaní</h3>
							<p className="text-muted-foreground mb-6">{errorMessage}</p>
							<Button onClick={handleRefresh} disabled={isRefetching}>
								<RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
								Skúsiť znova
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	// Transformácia dát z API na formát komponentu
	const author: AuthorDetailData = authorData;
	
	const name = `${author.firstName} ${author.lastName}`;
	const biography = author.biography || "Životopis nie je k dispozícii";
	const nationality = author.country;
	
	// Extrahovanie roku z dátumu narodenia
	const birthYear = author.dateOfBirth 
		? new Date(author.dateOfBirth).getFullYear() 
		: undefined;
	
	const deathYear = author.dateOfDeath 
		? new Date(author.dateOfDeath).getFullYear() 
		: undefined;
	
	const totalBooks = author.booksCount || 0;
	const availableBooks = 0; // Toto by sa malo získať z API, ak je dostupné
	const genres = author.books?.map(book => book.categoryName).filter(Boolean) || [];
	const awards: string[] = []; // Toto by sa malo získať z API, ak je dostupné
	
	// Farba avataru podľa ID autora
	const avatarColors = [
		"bg-gradient-to-br from-blue-600 to-purple-600",
		"bg-gradient-to-br from-green-600 to-teal-600",
		"bg-gradient-to-br from-red-600 to-orange-600",
		"bg-gradient-to-br from-yellow-600 to-orange-600",
		"bg-gradient-to-br from-purple-600 to-pink-600",
	];
	const avatarColor = avatarColors[author.authorId % avatarColors.length];

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.substring(0, 2);

	const stats = [
		{
			label: "Kníh v knižnici",
			value: totalBooks,
			icon: Book,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			label: "Dostupných",
			value: availableBooks,
			icon: TrendingUp,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			label: "Ocenení",
			value: awards.length,
			icon: Award,
			color: "text-yellow-600",
			bgColor: "bg-yellow-50",
		},
		{
			label: "Žánrov",
			value: genres.length,
			icon: Users,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
	];

	// Najobľúbenejšia kniha (prvých 5 kníh)
	const mostPopularBook = author.books?.[0]?.title || undefined;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="relative"
		>
			{/* Refresh button */}
			<div className="absolute top-4 right-4 z-10">
				<Button
					variant="outline"
					size="icon"
					onClick={handleRefresh}
					disabled={isRefetching}
					className="shadow-md"
				>
					<RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
				</Button>
			</div>

			{isRefetching && (
				<div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}

			<Card className="shadow-lg border-none bg-white/80 backdrop-blur">
				<CardHeader>
					<div className="flex items-start gap-6">
						<motion.div
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
						>
							<Avatar
								className={`w-24 h-24 ${avatarColor} text-white text-2xl font-bold`}
							>
								<AvatarFallback className="bg-transparent text-white text-2xl">
									{initials}
								</AvatarFallback>
							</Avatar>
						</motion.div>

						<div className="flex-1">
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-3xl mb-2">{name}</CardTitle>
									
									{author.email && (
										<motion.div
											className="text-sm text-gray-600 mb-1"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.1 }}
										>
											<span className="font-medium">Email:</span> {author.email}
										</motion.div>
									)}

									{author.website && (
										<motion.div
											className="text-sm text-gray-600 mb-1"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.15 }}
										>
											<span className="font-medium">Webstránka:</span>{' '}
											<a 
												href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												{author.website}
											</a>
										</motion.div>
									)}

									{author.status && (
										<motion.div
											className="text-sm text-gray-600 mb-3"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.2 }}
										>
											<Badge variant={author.isActive ? "default" : "secondary"}>
												{author.status}
											</Badge>
										</motion.div>
									)}
								</div>
							</div>

							<div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
								{birthYear && (
									<motion.div
										className="flex items-center gap-1"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
									>
										<Calendar className="h-4 w-4" />
										<span>
											{birthYear}
											{deathYear ? ` - ${deathYear}` : author.isActive ? " - súčasnosť" : ""}
										</span>
									</motion.div>
								)}

								{author.age && (
									<motion.div
										className="flex items-center gap-1"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.25 }}
									>
										<span className="font-medium">Vek:</span> {author.age} rokov
									</motion.div>
								)}

								<motion.div
									className="flex items-center gap-1"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									<Globe className="h-4 w-4" />
									<span>{nationality}</span>
								</motion.div>
							</div>

							<p className="text-gray-700 text-base leading-relaxed mb-3">
								{biography}
							</p>

							{mostPopularBook && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									<Badge variant="secondary" className="text-sm">
										Najobľúbenejšie: {mostPopularBook}
									</Badge>
								</motion.div>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Štatistiky */}
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

					{/* Žánre */}
					{genres.length > 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							<h3 className="font-semibold text-lg mb-3">Žánre</h3>
							<div className="flex flex-wrap gap-2">
								{[...new Set(genres)].map((genre, index) => (
									<motion.div
										key={genre}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.6 + index * 0.1 }}
										whileHover={{ scale: 1.1 }}
									>
										<Badge variant="outline" className="text-sm py-1 px-3">
											{genre}
										</Badge>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}

					{/* Zoznam kníh */}
					{author.books && author.books.length > 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.7 }}
						>
							<h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
								<Book className="h-5 w-5 text-blue-600" />
								Zoznam kníh ({author.books.length})
							</h3>
							<div className="space-y-3">
								{author.books.slice(0, 5).map((book, index) => (
									<motion.div
										key={book.id || index}
										className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.8 + index * 0.1 }}
										whileHover={{ x: 5 }}
									>
										<Book className="h-4 w-4 text-gray-500" />
										<div>
											<div className="font-medium">{book.title}</div>
											{book.publishedYear && (
												<div className="text-sm text-gray-600">
													Rok vydania: {book.publishedYear}
												</div>
											)}
										</div>
									</motion.div>
								))}
								{author.books.length > 5 && (
									<div className="text-sm text-gray-600 text-center pt-2">
										+ ďalších {author.books.length - 5} kníh
									</div>
								)}
							</div>
						</motion.div>
					)}

					{/* Ocenenia */}
					{awards.length > 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.9 }}
						>
							<h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
								<Award className="h-5 w-5 text-yellow-600" />
								Významné ocenenia
							</h3>
							<ul className="space-y-2">
								{awards.map((award, index) => (
									<motion.li
										key={award}
										className="text-gray-700 flex items-start gap-2"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 1.0 + index * 0.1 }}
									>
										<span className="text-yellow-600 mt-1">•</span>
										<span>{award}</span>
									</motion.li>
								))}
							</ul>
						</motion.div>
					)}

					{/* Meta informácie */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.1 }}
						className="text-sm text-gray-500 border-t pt-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="font-medium">Vytvorené:</span>{' '}
								{new Date(author.createdDate).toLocaleDateString('sk-SK')}
							</div>
							<div>
								<span className="font-medium">Posledná úprava:</span>{' '}
								{new Date(author.lastModified).toLocaleDateString('sk-SK')}
							</div>
						</div>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
};