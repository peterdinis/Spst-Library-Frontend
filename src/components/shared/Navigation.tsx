import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { BookOpen, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const navLinks = [
		{ to: "/", label: "Domov" },
		{ to: "/books", label: "Knihy" },
		{ to: "/categories", label: "Kategórie" },
		{ to: "/authors", label: "Spisovatelia" },
	] as const;

	const handleNavigation = () => {
		setIsMenuOpen(false);
	};

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
						{navLinks.map((link, index) => (
							<Link key={link.to} to={link.to} onClick={handleNavigation}>
								{({ isActive }) => (
									<motion.span
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className={`
											text-sm font-medium transition-colors hover:text-primary relative cursor-pointer
											${isActive ? "text-primary" : "text-foreground/80"}
										`}
									>
										{link.label}
									</motion.span>
								)}
							</Link>
						))}
					</nav>

					<div className="hidden md:flex items-center space-x-4">
						<ThemeToggle />
						<Button
							variant="default"
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

					{/* Mobile Menu Button */}
					<div className="flex items-center space-x-2 md:hidden">
						<ThemeToggle />
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
									{navLinks.map((link, index) => (
										<Link key={link.to} to={link.to} onClick={handleNavigation}>
											{({ isActive }) => (
												<motion.span
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className={`
														text-sm font-medium transition-colors py-2 text-left cursor-pointer block
														${
															isActive
																? "text-primary underline decoration-2 underline-offset-4"
																: "text-foreground/80 hover:text-primary"
														}
													`}
												>
													{link.label}
												</motion.span>
											)}
										</Link>
									))}
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: navLinks.length * 0.1 }}
										className="pt-2"
									>
										<Button
											variant="default"
											size="sm"
											className="w-full"
											onClick={() => {
												router.navigate({ to: "/login" });
												handleNavigation();
											}}
										>
											Prihlásenie
										</Button>
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
