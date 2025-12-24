import { useState, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { BookOpen, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/functions/auth/authFunctions";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileDropdown from "../auth/ProfileDropdown";

export function Navigation() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();

	// Query na kontrolu prihlásenia používateľa
	const {
		data: userResponse,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["userProfile"],
		queryFn: () => getCurrentUser(),
		retry: 1,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
	});

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
	const closeMenu = () => setIsMenuOpen(false);

	const isLoggedIn = userResponse?.success && userResponse.data;

	const navLinks = [
		{ to: "/", label: "Domov" },
		{ to: "/books", label: "Knihy" },
		{ to: "/categories", label: "Kategórie" },
		{ to: "/authors", label: "Spisovatelia" },
	] as const;

	// Admin linky
	const adminLinks = [
		{ to: "/admin/users", label: "Používatelia" },
		{ to: "/admin/books", label: "Správa kníh" },
	] as const;

	// Všetky linky zahrňujúce admin linky ak je používateľ admin
	const allNavLinks =
		isLoggedIn && userResponse.data?.roles?.includes("Admin")
			? [...navLinks, ...adminLinks]
			: navLinks;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<Link to="/">
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="flex items-center space-x-2 cursor-pointer"
						>
							<BookOpen className="h-6 w-6 text-primary" />
							<span className="text-xl font-bold text-primary">
								Školská knižnica
							</span>
						</motion.div>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-6">
						{allNavLinks.map((link, index) => (
							<Link key={link.to} to={link.to} onClick={closeMenu}>
								{({ isActive }) => (
									<motion.span
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className={`
											text-sm font-medium transition-colors hover:text-primary relative cursor-pointer
											${link.to.startsWith("/admin") ? "text-red-600 dark:text-red-400" : ""}
											${isActive ? "text-primary underline decoration-2 underline-offset-4" : "text-foreground/80"}
										`}
									>
										{link.label}
										{link.to.startsWith("/admin") && (
											<span className="absolute -top-1 -right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
										)}
									</motion.span>
								)}
							</Link>
						))}
					</nav>

					<div className="hidden md:flex items-center space-x-4">
						<ThemeToggle />

						{isLoading ? (
							// Loading state
							<div className="flex items-center space-x-3">
								<Skeleton className="h-9 w-20" />
								<Skeleton className="h-9 w-24" />
							</div>
						) : isLoggedIn ? (
							// Prihlásený používateľ - ProfileDropdown
							<ProfileDropdown
								showNotificationBadge={true}
								notificationCount={3}
								className="ml-2"
							/>
						) : (
							// Neprihlásený používateľ - Prihlásenie/Registrácia
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => router.navigate({ to: "/login" })}
								>
									Prihlásenie
								</Button>
								<Button
									variant="default"
									size="sm"
									onClick={() => router.navigate({ to: "/register" })}
								>
									Registrácia
								</Button>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="flex items-center space-x-2 md:hidden">
						<ThemeToggle />

						{isLoading ? (
							// Mobile loading state
							<Skeleton className="h-8 w-8 rounded-full" />
						) : isLoggedIn ? (
							// Mobile prihlásený používateľ - menšia verzia ProfileDropdown
							<div className="mr-2">
								<ProfileDropdown
									showNotificationBadge={true}
									notificationCount={3}
								/>
							</div>
						) : null}

						<button
							onClick={toggleMenu}
							className="p-2 text-foreground hover:text-primary transition-colors"
							aria-label="Toggle menu"
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="md:hidden overflow-hidden"
						>
							<nav className="py-4 border-t border-border/40">
								<div className="flex flex-col space-y-3">
									{allNavLinks.map((link, index) => (
										<Link key={link.to} to={link.to} onClick={closeMenu}>
											{({ isActive }) => (
												<motion.span
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className={`
														text-sm font-medium transition-colors py-2 text-left cursor-pointer block pl-4 border-l-2
														${link.to.startsWith("/admin") ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent"}
														${
															isActive
																? "text-primary underline decoration-2 underline-offset-4"
																: "text-foreground/80 hover:text-primary"
														}
													`}
												>
													{link.label}
													{link.to.startsWith("/admin") && (
														<span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full">
															Admin
														</span>
													)}
												</motion.span>
											)}
										</Link>
									))}

									{/* Mobile Auth Buttons */}
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: allNavLinks.length * 0.1 }}
										className="pt-2 space-y-2"
									>
										{isLoading ? (
											// Mobile loading state
											<div className="space-y-2">
												<Skeleton className="h-10 w-full" />
												<Skeleton className="h-10 w-full" />
											</div>
										) : isLoggedIn ? (
											// Mobile prihlásený používateľ - v mobile menü už je ProfileDropdown v headeri
											<div className="text-center py-2 text-sm text-muted-foreground">
												Vitajte, {userResponse.data?.fullName?.split(" ")[0]}
											</div>
										) : (
											// Mobile neprihlásený používateľ
											<>
												<Button
													variant="outline"
													size="sm"
													className="w-full"
													onClick={() => {
														router.navigate({ to: "/login" });
														closeMenu();
													}}
												>
													Prihlásenie
												</Button>
												<Button
													variant="default"
													size="sm"
													className="w-full"
													onClick={() => {
														router.navigate({ to: "/register" });
														closeMenu();
													}}
												>
													Registrácia
												</Button>
											</>
										)}
									</motion.div>

									{/* Mobile Theme Toggle */}
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: (allNavLinks.length + 0.5) * 0.1 }}
										className="pt-2 border-t border-border/40 mt-2"
									>
										<div className="flex items-center justify-between px-4 py-2">
											<span className="text-sm text-foreground/80">
												Tmavý režim
											</span>
											<ThemeToggle />
										</div>
									</motion.div>
								</div>
							</nav>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
}

export default Navigation;
