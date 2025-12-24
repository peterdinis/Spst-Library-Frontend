// components/ProfileDropdown.tsx
import { FC, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	User,
	LogOut,
	Settings,
	ChevronDown,
	Shield,
	BookOpen,
	Bell,
	HelpCircle,
	Moon,
	Sun,
	Mail,
	Calendar,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import {
	getUserProfile,
	logoutUser,
	type UserProfileDto,
} from "@/functions/auth/authFunctions";
import { cn } from "@/lib/utils";

// Props pre komponent
interface ProfileDropdownProps {
	className?: string;
	showNotificationBadge?: boolean;
	notificationCount?: number;
}

export const ProfileDropdown: FC<ProfileDropdownProps> = ({
	className,
	showNotificationBadge = false,
	notificationCount = 0,
}) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Query na načítanie profilu - používame getUserProfile
	const {
		data: profileResponse,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["userProfile"],
		queryFn: () => getUserProfile(),
		retry: 1,
		staleTime: 5 * 60 * 1000, // 5 minút
	});

	// Mutation pre odhlásenie
	const logoutMutation = useMutation({
		mutationFn: logoutUser,
		onSuccess: (response) => {
			if (response.success) {
				toast.success("Odhlásenie úspešné", {
					description: "Boli ste úspešne odhlásený",
					className: "bg-emerald-600 text-white",
				});

				// Invalidate všetky queries
				queryClient.invalidateQueries({ queryKey: ["userProfile"] });
				queryClient.clear();

				// Presmerovanie na login
				router.navigate({ to: "/login" });
			} else {
				toast.error("Odhlásenie zlyhalo", {
					description: response.message || "Nepodarilo sa odhlásiť",
				});
			}
		},
		onError: (error: any) => {
			toast.error("Chyba", {
				description: error.message || "Pri odhlásení nastala chyba",
			});
		},
	});

	// Funkcie pre roly
	const getRoleBadgeColor = (role: string): string => {
		switch (role.toLowerCase()) {
			case "admin":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
			case "teacher":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
			case "student":
				return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role.toLowerCase()) {
			case "admin":
				return <Shield className="h-3 w-3" />;
			case "teacher":
				return <BookOpen className="h-3 w-3" />;
			case "student":
				return <User className="h-3 w-3" />;
			default:
				return <User className="h-3 w-3" />;
		}
	};

	// Funkcie pre dátum
	const formatDate = (dateString?: string): string => {
		if (!dateString) return "Neuvedené";
		try {
			return new Date(dateString).toLocaleDateString("sk-SK", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		} catch {
			return "Neuvedené";
		}
	};

	// Funkcie pre inicialy
	const getInitials = (name: string): string => {
		if (!name || name.trim().length === 0) return "??";
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Funkcie pre dark mode toggle
	const toggleDarkMode = () => {
		setIsDarkMode(!isDarkMode);
		// Tu by ste mali implementovať toggle pre celú aplikáciu
		toast.info(isDarkMode ? "Zapnutý svetlý režim" : "Zapnutý tmavý režim", {
			duration: 2000,
		});
	};

	// Handler pre odhlásenie
	const handleLogout = () => {
		// TODO:
	};

	// Handler pre refetch profilu
	const handleRefetchProfile = () => {
		refetch();
	};

	// Stavové premenné
	const userProfile = profileResponse?.data;
	const isLoadingProfile = isLoading;
	const hasError = !!error || profileResponse?.error;
	const isLoggedIn = userProfile && profileResponse?.success;

	// Avatar fallback text
	const avatarFallback = userProfile ? getInitials(userProfile.fullName) : "??";

	// Ak je chyba a nie je to loading, zobrazíme error state
	if (hasError && !isLoadingProfile) {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Button
					variant="outline"
					onClick={() => router.navigate({ to: "/login" })}
					className="gap-2"
				>
					<LogOut className="h-4 w-4" />
					<span>Prihlásiť sa</span>
				</Button>
			</div>
		);
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"relative h-10 px-3 rounded-full hover:bg-accent/50 transition-all duration-200",
						isOpen && "bg-accent",
						className,
					)}
					disabled={isLoadingProfile || logoutMutation.isPending}
				>
					{isLoadingProfile ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-8 w-8 rounded-full" />
							<div className="space-y-1.5 hidden md:block">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-2 w-12" />
							</div>
						</div>
					) : isLoggedIn && userProfile ? (
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="h-8 w-8 border-2 border-background">
									<AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
										{avatarFallback}
									</AvatarFallback>
								</Avatar>

								{/* Online status */}
								<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />

								{/* Notification badge */}
								{showNotificationBadge && notificationCount > 0 && (
									<div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 border-2 border-background flex items-center justify-center">
										<span className="text-xs font-bold text-white">
											{notificationCount > 9 ? "9+" : notificationCount}
										</span>
									</div>
								)}
							</div>

							<div className="hidden md:block text-left">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm truncate max-w-[120px]">
										{userProfile.fullName?.split(" ")[0] || "Používateľ"}
									</span>
									{userProfile.roles &&
										userProfile.roles.map((role) => (
											<Badge
												key={role}
												variant="outline"
												className={cn(
													"text-[10px] px-1.5 py-0 h-4",
													getRoleBadgeColor(role),
												)}
											>
												{getRoleIcon(role)}
											</Badge>
										))}
								</div>
								<span className="text-xs text-muted-foreground truncate max-w-[140px] block">
									{userProfile.email || ""}
								</span>
							</div>

							<ChevronDown
								className={cn(
									"h-4 w-4 transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<User className="h-4 w-4" />
							<span className="hidden md:inline">Profil</span>
							<ChevronDown
								className={cn(
									"h-4 w-4 transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</div>
					)}
				</Button>
			</DropdownMenuTrigger>

			<AnimatePresence>
				{isOpen && (
					<DropdownMenuContent
						align="end"
						className="w-80 p-0 overflow-hidden"
						forceMount
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.15 }}
						>
							{/* Hlavička profilu */}
							{isLoggedIn && userProfile ? (
								<>
									<div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20">
										<div className="flex items-start gap-4">
											<Avatar className="h-14 w-14 border-4 border-background/80 shadow-lg">
												<AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
													{avatarFallback}
												</AvatarFallback>
											</Avatar>

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-bold text-lg truncate">
														{userProfile.fullName || "Používateľ"}
													</h3>
													{userProfile.roles?.includes("Admin") && (
														<Badge variant="default" className="bg-red-600">
															<Shield className="h-3 w-3 mr-1" />
															Admin
														</Badge>
													)}
												</div>

												<div className="space-y-2">
													<div className="flex items-center gap-2 text-sm">
														<Mail className="h-3.5 w-3.5 text-muted-foreground" />
														<span className="truncate">
															{userProfile.email || ""}
														</span>
													</div>

													<div className="flex items-center gap-2 text-sm">
														<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
														<span>
															Posledné prihlásenie:{" "}
															{formatDate(userProfile.lastLogin)}
														</span>
													</div>
												</div>
											</div>
										</div>

										{/* Roly */}
										{userProfile.roles && userProfile.roles.length > 0 && (
											<div className="mt-4 flex flex-wrap gap-2">
												{userProfile.roles.map((role) => (
													<Badge
														key={role}
														variant="outline"
														className={cn("gap-1.5", getRoleBadgeColor(role))}
													>
														{getRoleIcon(role)}
														{role === "Admin"
															? "Administrátor"
															: role === "Teacher"
																? "Učiteľ"
																: role === "Student"
																	? "Študent"
																	: role}
													</Badge>
												))}
											</div>
										)}
									</div>

									<DropdownMenuSeparator />

									{/* Hlavné menu */}
									<DropdownMenuGroup>
										<DropdownMenuItem
											onClick={() => router.navigate({ to: "/profile" })}
											className="cursor-pointer py-3 px-4"
										>
											<User className="mr-3 h-4 w-4" />
											<span>Môj profil</span>
											<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
										</DropdownMenuItem>

										<DropdownMenuItem
											onClick={() => router.navigate({ to: "/settings" })}
											className="cursor-pointer py-3 px-4"
										>
											<Settings className="mr-3 h-4 w-4" />
											<span>Nastavenia</span>
											<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
										</DropdownMenuItem>

										{showNotificationBadge && (
											<DropdownMenuItem
												onClick={() =>
													router.navigate({ to: "/notifications" })
												}
												className="cursor-pointer py-3 px-4"
											>
												<div className="relative mr-3">
													<Bell className="h-4 w-4" />
													{notificationCount > 0 && (
														<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600" />
													)}
												</div>
												<span>Notifikácie</span>
												{notificationCount > 0 && (
													<Badge variant="destructive" className="ml-auto">
														{notificationCount}
													</Badge>
												)}
											</DropdownMenuItem>
										)}
									</DropdownMenuGroup>

									<DropdownMenuSeparator />

									{/* Nastavenia */}
									<div className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{isDarkMode ? (
													<Moon className="h-4 w-4 text-muted-foreground" />
												) : (
													<Sun className="h-4 w-4 text-muted-foreground" />
												)}
												<div>
													<p className="text-sm font-medium">Tmavý režim</p>
													<p className="text-xs text-muted-foreground">
														{isDarkMode ? "Zapnuté" : "Vypnuté"}
													</p>
												</div>
											</div>
											<Switch
												checked={isDarkMode}
												onCheckedChange={toggleDarkMode}
												className="data-[state=checked]:bg-blue-600"
											/>
										</div>
									</div>

									<DropdownMenuSeparator />

									{/* Pomoc a odhlásenie */}
									<DropdownMenuGroup>
										<DropdownMenuItem
											onClick={() => router.navigate({ to: "/help" })}
											className="cursor-pointer py-3 px-4"
										>
											<HelpCircle className="mr-3 h-4 w-4" />
											<span>Pomoc a podpora</span>
										</DropdownMenuItem>

										<DropdownMenuItem
											onClick={handleLogout}
											disabled={logoutMutation.isPending}
											className="cursor-pointer py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30"
										>
											<LogOut className="mr-3 h-4 w-4" />
											<span>Odhlásiť sa</span>
											{logoutMutation.isPending && (
												<div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											)}
										</DropdownMenuItem>
									</DropdownMenuGroup>

									{/* Footer */}
									<div className="p-4 pt-3 border-t">
										<p className="text-xs text-muted-foreground text-center">
											© {new Date().getFullYear()} Knižnica SPŠT • v1.0.0
										</p>
									</div>
								</>
							) : (
								// Nenahlásený stav
								<div className="p-6">
									<div className="text-center space-y-4">
										<div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
											<User className="h-8 w-8 text-muted-foreground" />
										</div>

										<div>
											<h3 className="font-bold text-lg mb-2">
												Nie ste prihlásený
											</h3>
											<p className="text-sm text-muted-foreground mb-4">
												Prihláste sa pre prístup k vášmu profilu a nastaveniam
											</p>
										</div>

										<div className="flex flex-col gap-3">
											<Button
												onClick={() => router.navigate({ to: "/login" })}
												className="w-full"
											>
												<LogOut className="mr-2 h-4 w-4" />
												Prihlásiť sa
											</Button>

											<Button
												variant="outline"
												onClick={() => router.navigate({ to: "/register" })}
												className="w-full"
											>
												<User className="mr-2 h-4 w-4" />
												Vytvoriť účet
											</Button>
										</div>

										<div className="pt-4 border-t">
											<p className="text-xs text-muted-foreground">
												Demo účty sú dostupné na prihlasovacej stránke
											</p>
										</div>
									</div>
								</div>
							)}
						</motion.div>
					</DropdownMenuContent>
				)}
			</AnimatePresence>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
