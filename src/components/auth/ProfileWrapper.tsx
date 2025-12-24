import { FC, ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	User,
	BookOpen,
	Settings,
	Bell,
	HelpCircle,
	LogOut,
	Home,
	Library,
	Calendar,
	Star,
	History as HistoryIcon,
	CreditCard,
	Shield,
	Mail,
	Phone,
	Edit,
	Camera,
	Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "@/functions/auth/authFunctions";
import { toast } from "sonner";
// interface ProfileWrapperProps removed props in favor of context-based data fetching

interface ProfileWrapperProps {
	children?: ReactNode;
}

const ProfileWrapper: FC<ProfileWrapperProps> = ({ children }) => {
	const router = useRouter();

	const {
		data: authResponse,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["current-user"],
		queryFn: () => getCurrentUser(),
	});

	const handleLogout = async () => {
		try {
			const result = await logoutUser();
			if (result.success) {
				toast.success("Logged out successfully");
				router.navigate({ to: "/login" });
			} else {
				toast.error("Logout failed", { description: result.message });
			}
		} catch (error) {
			toast.error("An error occurred during logout");
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center gap-4"
				>
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground font-medium animate-pulse">
						Loading your profile...
					</p>
				</motion.div>
			</div>
		);
	}

	if (isError || !authResponse?.success || !authResponse.data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-xl">
					<CardHeader className="text-center">
						<div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
							<AlertCircle className="h-6 w-6 text-red-600" />
						</div>
						<CardTitle className="text-xl">Authentication Required</CardTitle>
						<CardDescription>
							{authResponse?.message || "Please log in to view your profile."}
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button className="w-full" asChild>
							<Link to="/login">Go to Login</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	const user = authResponse.data;

	// Mocking additional data not yet provided by the API
	const userData = {
		name: user.fullName || "User",
		email: user.email,
		avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
		memberSince: "2023-09-01", // Default for now
		studentId: "STU2023001",
		grade: "4.A",
		department: "Informatika",
	};

	const stats = {
		booksBorrowed: 24,
		booksReturned: 20,
		currentLoans: 4,
		totalRead: 18,
		readingGoal: 25,
		fines: 0,
	};

	const getRoleBadge = (roles: string[]) => {
		const primaryRole = roles[0]?.toLowerCase() || "student";
		const roleConfig = {
			student: {
				label: "Student",
				variant: "default" as const,
				color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
			},
			teacher: {
				label: "Teacher",
				variant: "secondary" as const,
				color:
					"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
			},
			librarian: {
				label: "Librarian",
				variant: "outline" as const,
				color:
					"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
			},
			admin: {
				label: "Administrator",
				variant: "destructive" as const,
				color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
			},
		};

		return (
			roleConfig[primaryRole as keyof typeof roleConfig] || roleConfig.student
		);
	};

	const roleConfig = getRoleBadge(user.roles);
	const readingProgress = (stats.totalRead / stats.readingGoal) * 100;

	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
				>
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
							My Profile
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Manage your account and library activities
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" size="sm" asChild>
							<Link to="/">
								<Home className="mr-2 h-4 w-4" />
								Home
							</Link>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link to="/books">
								<BookOpen className="mr-2 h-4 w-4" />
								Library
							</Link>
						</Button>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Profile Info */}
					<motion.div
						className="lg:col-span-1 space-y-6"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						{/* Profile Card */}
						<Card className="shadow-lg border-0 bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30">
							<CardContent className="p-6">
								<div className="flex flex-col items-center text-center">
									<div className="relative mb-4">
										<Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl">
											<AvatarImage
												src={userData.avatarUrl}
												alt={userData.name}
											/>
											<AvatarFallback className="text-2xl bg-linear-to-br from-blue-600 to-purple-600">
												{userData.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														size="icon"
														className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
													>
														<Camera className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Zmeniť fotku</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>

									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
										{userData.name}
									</h2>
									<Badge
										variant={roleConfig.variant}
										className={`mt-2 ${roleConfig.color}`}
									>
										{roleConfig.label}
									</Badge>

									<div className="mt-4 space-y-3 w-full">
										<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4 text-gray-500" />
												<span className="text-sm text-gray-600 dark:text-gray-400">
													Email
												</span>
											</div>
											<span className="text-sm font-medium">
												{userData.email}
											</span>
										</div>

										{userData.studentId && (
											<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-gray-500" />
													<span className="text-sm text-gray-600 dark:text-gray-400">
														ID Študenta
													</span>
												</div>
												<code className="text-sm font-mono font-medium bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
													{userData.studentId}
												</code>
											</div>
										)}

										<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
											<div className="flex items-center gap-2">
												<Library className="h-4 w-4 text-gray-500" />
												<span className="text-sm text-gray-600 dark:text-gray-400">
													Grade
												</span>
											</div>
											<span className="text-sm font-medium">
												{userData.grade}
											</span>
										</div>
									</div>

									<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full">
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-600 dark:text-gray-400">
												Member Since:
											</span>
											<span className="font-medium">
												{new Date(userData.memberSince).toLocaleDateString(
													"en-US",
												)}
											</span>
										</div>
									</div>
								</div>
							</CardContent>

							<CardFooter className="bg-gray-50 dark:bg-gray-800/30 px-6 py-4">
								<Button variant="outline" className="w-full" asChild>
									<Link to="/profile" as={"any"}>
										<Edit className="mr-2 h-4 w-4" />
										Edit Profile
									</Link>
								</Button>
							</CardFooter>
						</Card>

						{/* Quick Stats */}
						<Card className="shadow-lg border-0">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<Star className="h-5 w-5 text-amber-500" />
									Rýchle štatistiky
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Aktívne výpožičky
										</span>
										<Badge variant="outline" className="font-bold">
											{stats.currentLoans}
										</Badge>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Celkom prečítané
										</span>
										<Badge variant="outline" className="font-bold">
											{stats.totalRead}
										</Badge>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											Pokuty
										</span>
										<div className="flex items-center gap-2">
											{stats.fines > 0 ? (
												<Badge variant="destructive" className="font-bold">
													{stats.fines} €
												</Badge>
											) : (
												<Badge className="font-bold">
													<CheckCircle className="h-3 w-3 mr-1" />
													Žiadne
												</Badge>
											)}
										</div>
									</div>
								</div>

								<Separator />

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">Čitateľský cieľ</span>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											{stats.totalRead} / {stats.readingGoal}
										</span>
									</div>
									<Progress value={readingProgress} className="h-2" />
									<div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
										{readingProgress >= 100
											? "Cieľ splnený! 🎉"
											: "Zostáva prečítať " +
												(stats.readingGoal - stats.totalRead) +
												" kníh"}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card className="shadow-lg border-0">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<Settings className="h-5 w-5 text-gray-500" />
									Rýchle akcie
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link to={"/loans" as any}>
											<BookOpen className="mr-3 h-4 w-4" />
											My Loans
										</Link>
									</Button>

									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link to={"/reservations" as any}>
											<Calendar className="mr-3 h-4 w-4" />
											Reservations
										</Link>
									</Button>

									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link to={"/history" as any}>
											<HistoryIcon className="mr-3 h-4 w-4" />
											History
										</Link>
									</Button>

									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link to={"/fines" as any}>
											<CreditCard className="mr-3 h-4 w-4" />
											Fines and Payments
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Right Column - Main Content */}
					<motion.div
						className="lg:col-span-2 space-y-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{/* Tabs Navigation */}
						<Card className="shadow-lg border-0 overflow-hidden">
							<Tabs defaultValue="activity" className="w-full">
								<div className="border-b">
									<TabsList className="w-full justify-start h-auto bg-transparent p-0">
										<TabsTrigger
											value="activity"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
										>
											<BookOpen className="mr-2 h-4 w-4" />
											Aktivita
										</TabsTrigger>
										<TabsTrigger
											value="settings"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
										>
											<Settings className="mr-2 h-4 w-4" />
											Nastavenia
										</TabsTrigger>
										<TabsTrigger
											value="notifications"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
										>
											<Bell className="mr-2 h-4 w-4" />
											Notifikácie
										</TabsTrigger>
										<TabsTrigger
											value="security"
											className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-6 py-3"
										>
											<Shield className="mr-2 h-4 w-4" />
											Bezpečnosť
										</TabsTrigger>
									</TabsList>
								</div>

								{/* Tabs Content */}
								<TabsContent value="activity" className="p-6">
									{children || (
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-semibold mb-4">
													Nedávna aktivita
												</h3>
												<div className="space-y-3">
													{[
														{
															icon: BookOpen,
															text: "Vypožičali ste si knihu 'Základy programovania'",
															time: "Pred 2 dňami",
														},
														{
															icon: BookOpen,
															text: "Vrátili ste knihu 'Dekameron'",
															time: "Pred 5 dňami",
														},
														{
															icon: Star,
															text: "Ohodnotili ste knihu '1984' - 5 hviezd",
															time: "Pred týždňom",
														},
														{
															icon: Calendar,
															text: "Rezervovali ste si knihu 'Harry Potter'",
															time: "Pred 2 týždňami",
														},
													].map((activity, index) => (
														<div
															key={index}
															className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
														>
															<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
																<activity.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
															</div>
															<div className="flex-1">
																<p className="text-sm">{activity.text}</p>
																<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
																	{activity.time}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>

											<Separator />

											<div>
												<h3 className="text-lg font-semibold mb-4">
													Aktívne výpožičky
												</h3>
												<div className="space-y-3">
													{[
														{
															title: "Základy programovania",
															dueDate: "2024-01-20",
															progress: 80,
														},
														{
															title: "Sapiens: Stručná história ľudstva",
															dueDate: "2024-01-25",
															progress: 60,
														},
														{
															title: "Hobbit",
															dueDate: "2024-02-01",
															progress: 40,
														},
														{
															title: "Mali princ",
															dueDate: "2024-02-05",
															progress: 20,
														},
													].map((loan, index) => {
														const daysLeft = Math.ceil(
															(new Date(loan.dueDate).getTime() - Date.now()) /
																(1000 * 60 * 60 * 24),
														);
														const isUrgent = daysLeft <= 3;

														return (
															<Card
																key={index}
																className="border-l-4 border-l-blue-500"
															>
																<CardContent className="p-4">
																	<div className="flex items-center justify-between">
																		<div>
																			<h4 className="font-medium">
																				{loan.title}
																			</h4>
																			<div className="flex items-center gap-2 mt-1">
																				<span
																					className={`text-xs ${isUrgent ? "text-red-600 font-bold" : "text-gray-500"}`}
																				>
																					Splatné do:{" "}
																					{new Date(
																						loan.dueDate,
																					).toLocaleDateString("sk-SK")}
																				</span>
																				{isUrgent && (
																					<Badge variant="destructive">
																						Urgent!
																					</Badge>
																				)}
																			</div>
																		</div>
																		<Badge
																			variant={
																				isUrgent ? "destructive" : "outline"
																			}
																		>
																			Zostáva {daysLeft} dní
																		</Badge>
																	</div>
																	<Progress
																		value={loan.progress}
																		className="h-1.5 mt-3"
																	/>
																</CardContent>
															</Card>
														);
													})}
												</div>
											</div>
										</div>
									)}
								</TabsContent>

								<TabsContent value="settings" className="p-6">
									<div className="space-y-6">
										<h3 className="text-lg font-semibold">Nastavenia účtu</h3>

										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label htmlFor="email-notifications">
														Email notifikácie
													</Label>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														Dostávajte upozornenia na novinky a upomienky
													</p>
												</div>
												<Switch id="email-notifications" defaultChecked />
											</div>

											<Separator />

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label htmlFor="dark-mode">Tmavý režim</Label>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														Prepnite medzi svetlým a tmavým vzhľadom
													</p>
												</div>
												<Switch id="dark-mode" />
											</div>

											<Separator />

											<div className="flex items-center justify-between">
												<div className="space-y-0.5">
													<Label htmlFor="reading-goal">Čitateľský cieľ</Label>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														Stanovte si cieľ pre počet prečítaných kníh ročne
													</p>
												</div>
												<div className="flex items-center gap-2">
													<input
														type="number"
														id="reading-goal"
														min="1"
														max="100"
														defaultValue={stats.readingGoal}
														className="w-20 px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
													/>
													<Button size="sm">Uložiť</Button>
												</div>
											</div>
										</div>
									</div>
								</TabsContent>

								<TabsContent value="notifications" className="p-6">
									<div className="space-y-6">
										<h3 className="text-lg font-semibold">
											Správy a upozornenia
										</h3>

										<div className="space-y-3">
											{[
												{
													type: "info",
													title: "Nové knihy v knižnici",
													message:
														"Pridali sme 12 nových kníh z kategórie technológie",
													time: "Dnes 10:30",
												},
												{
													type: "warning",
													title: "Blíži sa dátum vrátenia",
													message:
														"Kniha 'Základy programovania' je splatná za 2 dni",
													time: "Včera 15:45",
												},
												{
													type: "success",
													title: "Rezervácia potvrdená",
													message:
														"Vaša rezervácia knihy 'Harry Potter' bola potvrdená",
													time: "Pred 3 dňami",
												},
												{
													type: "info",
													title: "Čitateľská výzva",
													message: "Zúčastnite sa januárovej čitateľskej výzvy",
													time: "Pred týždňom",
												},
											].map((notification, index) => (
												<div
													key={index}
													className="flex items-start gap-3 p-4 border rounded-lg"
												>
													<div
														className={`p-2 rounded-full ${
															notification.type === "warning"
																? "bg-amber-100 dark:bg-amber-900"
																: notification.type === "success"
																	? "bg-emerald-100 dark:bg-emerald-900"
																	: "bg-blue-100 dark:bg-blue-900"
														}`}
													>
														{notification.type === "warning" ? (
															<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
														) : notification.type === "success" ? (
															<CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
														) : (
															<Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
														)}
													</div>
													<div className="flex-1">
														<h4 className="font-medium">
															{notification.title}
														</h4>
														<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
															{notification.message}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
															{notification.time}
														</p>
													</div>
													<Button variant="ghost" size="sm">
														Označiť ako prečítané
													</Button>
												</div>
											))}
										</div>
									</div>
								</TabsContent>

								<TabsContent value="security" className="p-6">
									<div className="space-y-6">
										<h3 className="text-lg font-semibold">Bezpečnosť účtu</h3>

										<div className="space-y-4">
											<div>
												<h4 className="font-medium mb-2">Zmena hesla</h4>
												<div className="space-y-3 max-w-md">
													<Input type="password" placeholder="Súčasné heslo" />
													<Input type="password" placeholder="Nové heslo" />
													<Input
														type="password"
														placeholder="Potvrďte nové heslo"
													/>
													<Button>Zmeniť heslo</Button>
												</div>
											</div>

											<Separator />

											<div>
												<h4 className="font-medium mb-2">
													Pripojené zariadenia
												</h4>
												<div className="space-y-2">
													<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
														<div className="flex items-center gap-3">
															<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
																<Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
															</div>
															<div>
																<p className="font-medium">iPhone 13</p>
																<p className="text-sm text-gray-500 dark:text-gray-400">
																	Connected now
																</p>
															</div>
														</div>
														<Badge variant="default">Active</Badge>
													</div>

													<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
														<div className="flex items-center gap-3">
															<div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
																<BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
															</div>
															<div>
																<p className="font-medium">Windows PC</p>
																<p className="text-sm text-gray-500 dark:text-gray-400">
																	Pred 3 dňami
																</p>
															</div>
														</div>
														<Badge variant="outline">Neaktívne</Badge>
													</div>
												</div>
											</div>
										</div>
									</div>
								</TabsContent>
							</Tabs>
						</Card>

						{/* Help and Support */}
						<Card className="shadow-lg border-0">
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<HelpCircle className="h-5 w-5 text-gray-500" />
									Pomoc a podpora
								</CardTitle>
								<CardDescription>
									Potrebujete pomoc alebo máte otázky?
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<Button
										variant="outline"
										className="h-auto py-4 flex flex-col gap-2"
										asChild
									>
										<Link to="/help/faq">
											<HelpCircle className="h-6 w-6 mb-2" />
											<span className="font-medium">FAQ</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												Často kladené otázky
											</span>
										</Link>
									</Button>

									<Button
										variant="outline"
										className="h-auto py-4 flex flex-col gap-2"
										asChild
									>
										<Link to={"/help/contact" as any}>
											<Mail className="h-6 w-6 mb-2" />
											<span className="font-medium">Contact</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												Contact a librarian
											</span>
										</Link>
									</Button>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												className="h-auto py-4 flex flex-col gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
											>
												<LogOut className="h-6 w-6 mb-2" />
												<span className="font-medium">Odhlásiť sa</span>
												<span className="text-sm">Ukončiť reláciu</span>
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>
													Do you really want to log out? You will lose access to
													your loans and reservations until you log in again.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleLogout}
													className="bg-red-600 hover:bg-red-700"
												>
													Logout
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default ProfileWrapper;
