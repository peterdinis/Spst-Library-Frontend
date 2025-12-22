"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, BookOpen, AlertCircle } from "lucide-react";
import { getAllCategories } from "@/functions/categories/getAllCategories";

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

// Keep books data static for now (or you could fetch this too)
const MOCK_BOOKS: Book[] = [
    {
        id: "1",
        title: "Veľký Gatsby",
        author: "F. Scott Fitzgerald",
        description: "Román o americkom sne, láske a spoločenskej triede v období jazzu.",
        publishedYear: 1925,
        categoryId: "1",
        availableCopies: 3,
        totalCopies: 5,
        isAvailable: true,
    },
    // ... other books
];

const AllCategoriesWrapper: FC = () => {
    const navigate = useNavigate();

    // Use useQuery to fetch categories from your server function
    const {
        data: categoriesResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            // Call your server function
            const response = await getAllCategories();
            
            // Check if the response was successful
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch categories");
            }
            
            // Transform data if needed to match your Category interface
            return response.data.map((category: any) => ({
                id: category.id?.toString() || "",
                name: category.name || "",
                description: category.description || "",
                color: category.color || getRandomColor(),
                icon: category.icon || "Grid",
            })) as Category[];
        },
        // Configuration options [citation:1]
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for this long
        gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
        retry: 3, // Retry failed requests 3 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    // Helper function to generate random colors for categories without specified colors
    const getRandomColor = () => {
        const colors = [
            "#3B82F6", "#8B5CF6", "#EF4444", "#10B981", 
            "#F59E0B", "#EC4899", "#14B8A6", "#6B7280"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const getCategoryBookCount = (categoryId: string) => {
        return MOCK_BOOKS.filter((book) => book.categoryId === categoryId).length;
    };

    const getCategoryColor = (categoryId: string) => {
        const category = categoriesResponse?.find((cat) => cat.id === categoryId);
        return category?.color || getRandomColor();
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

    const availableBooksCount = MOCK_BOOKS.filter((b) => b.availableCopies > 0).length;
    const totalBooksCount = MOCK_BOOKS.length;

    // Loading state using isLoading from useQuery
    if (isLoading) {
        return (
            <section className="py-16 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Kategórie kníh
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Načítavam kategórie...
                        </p>
                    </div>
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">Načítavam kategórie...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Error state [citation:6]
    if (isError) {
        return (
            <section className="py-16 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Chyba pri načítaní
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {error instanceof Error ? error.message : "Nastala chyba pri načítaní kategórií"}
                        </p>
                    </div>
                    <div className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                            Nepodarilo sa načítať kategórie. Skúste to prosím neskôr.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Skúsiť znova
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const categories = categoriesResponse || [];

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
                        {categories.length} kategórií a {MOCK_BOOKS.length} kníh.
                    </p>
                </motion.div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Žiadne kategórie neboli nájdené</p>
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
                                                                MOCK_BOOKS.filter(
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