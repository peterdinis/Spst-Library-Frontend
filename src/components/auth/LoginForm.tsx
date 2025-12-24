import { FC } from "react";
import { useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Mail,
	Lock,
	LogIn,
	BookOpen,
	Sparkles,
	AlertCircle,
	Key,
	User,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginInput } from "@/api/authApi";
import { loginUser } from "@/functions/auth/authFunctions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const LoginForm: FC = () => {
	const router = useRouter();

	const loginMutation = useMutation({
		mutationFn: (data: LoginInput) => loginUser({ data }),
		onSuccess: (response) => {
			if (response.success) {
				toast.success("Prihlásenie úspešné!", {
					description: "Vitajte späť!",
					className: "bg-emerald-600 text-white",
				});

				router.navigate({ to: "/profile" });
			} else {
				if (response.statusCode === 423) {
					toast.error("Účet zablokovaný", {
						description:
							response.message ||
							"Účet je dočasne zablokovaný. Skúste to neskôr.",
						className: "bg-amber-600 text-white",
					});
				} else {
					toast.error("Prihlásenie zlyhalo", {
						description: response.message || "Nesprávne prihlasovacie údaje",
					});
				}
			}
		},
		onError: (error: any) => {
			// Vylepšený error handling
			if (error?.statusCode === 423) {
				toast.error("Účet zablokovaný", {
					description:
						"Účet je dočasne zablokovaný kvôli viacerým neúspešným pokusom. Skúste to neskôr.",
					className: "bg-amber-600 text-white",
				});
				return;
			}

			if (error?.statusCode === 401) {
				toast.error("Neplatné prihlasovacie údaje", {
					description: "Skontrolujte email a heslo",
				});
				return;
			}

			toast.error("Chyba", {
				description: error.message || "Pri prihlásení nastala chyba",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		onSubmit: async ({ value }) => {
			loginMutation.mutate(value);
		},
	});

	const isLoading = loginMutation.isPending;

	// Funkcia pre zobrazenie detailnej chyby
	const renderErrorDetails = () => {
		if (!loginMutation.error && !loginMutation.data?.error) return null;

		const errorData = loginMutation.error || loginMutation.data;

		if (errorData?.statusCode === 423) {
			return (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: -10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800"
				>
					<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
					<div className="flex items-start gap-3 ml-3">
						<Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
						<div>
							<p className="text-sm font-medium text-amber-800 dark:text-amber-300">
								Účet je dočasne zablokovaný
							</p>
							<p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
								Kvôli viacerým neúspešným pokusom. Skúste to znova o 15 minút.
							</p>
						</div>
					</div>
				</motion.div>
			);
		}

		if (errorData?.statusCode === 401) {
			return (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: -10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
				>
					<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
					<div className="flex items-start gap-3 ml-3">
						<Key className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
						<div>
							<p className="text-sm font-medium text-red-800 dark:text-red-300">
								Nesprávne prihlasovacie údaje
							</p>
							<p className="text-sm text-red-700 dark:text-red-400 mt-1">
								Skontrolujte svoj email a heslo. Ak ste zabudli heslo,
								kontaktujte administrátora.
							</p>
						</div>
					</div>
				</motion.div>
			);
		}

		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: -10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
			>
				<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
				<p className="text-sm text-red-700 dark:text-red-300 ml-3">
					{loginMutation.error?.message || "Pri prihlásení nastala chyba"}
				</p>
			</motion.div>
		);
	};

	return (
		<div className="w-full max-w-md mx-auto mt-5">
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="flex justify-center mb-8"
			>
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
					<div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
						<BookOpen className="h-12 w-12 text-white" />
					</div>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-xl">
					<CardHeader className="space-y-3 pb-8">
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Vitajte späť
							</CardTitle>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<CardDescription className="text-center text-base">
								Prihláste sa do svojho účtu a pokračujte v čítaní
							</CardDescription>
						</motion.div>
					</CardHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<CardContent className="space-y-6">
							{/* Zobrazenie chybových hlášok */}
							{(loginMutation.error || loginMutation.data?.error) &&
								renderErrorDetails()}

							{/* Email */}
							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim()) return "Email je povinný";
										const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
										if (!emailRegex.test(value)) return "Zadajte platný email";
										return undefined;
									},
								}}
								children={(field) => (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.4 }}
										className="space-y-2"
									>
										<label
											htmlFor={field.name}
											className="text-sm font-semibold flex items-center gap-2"
										>
											<Sparkles className="h-3 w-3 text-blue-600" />
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="vas@email.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												} ${isLoading ? "opacity-50" : ""}`}
												disabled={isLoading}
											/>
										</div>
										{field.state.meta.errors &&
											field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 italic">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</motion.div>
								)}
							/>

							{/* Heslo */}
							<form.Field
								name="password"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim()) return "Heslo je povinné";
										if (value.length < 6)
											return "Heslo musí mať aspoň 6 znakov";
										return undefined;
									},
								}}
								children={(field) => (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.5 }}
										className="space-y-2"
									>
										<label
											htmlFor={field.name}
											className="text-sm font-semibold flex items-center gap-2"
										>
											<Sparkles className="h-3 w-3 text-purple-600" />
											Heslo
										</label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												} ${isLoading ? "opacity-50" : ""}`}
												disabled={isLoading}
											/>
										</div>
										{field.state.meta.errors &&
											field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 italic">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
									</motion.div>
								)}
							/>

							{/* Remember Me */}
							<form.Field
								name="rememberMe"
								children={(field) => (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.6 }}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={field.name}
											checked={field.state.value}
											onCheckedChange={(checked: boolean) =>
												field.handleChange(checked as boolean)
											}
											disabled={isLoading}
											className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
										/>
										<label
											htmlFor={field.name}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Zapamätať si ma
										</label>
									</motion.div>
								)}
							/>

							{/* Demo účty */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.7 }}
								className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 border border-blue-100 dark:border-blue-900"
							>
								<p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
									<User className="h-4 w-4" />
									Demo účty:
								</p>
								<ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
									<li className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
										<span className="font-medium">Admin:</span> admin@library.sk
									</li>
									<li className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
										<span className="font-medium">Učiteľ:</span>{" "}
										teacher@library.sk
									</li>
									<li className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
										<span className="font-medium">Študent:</span>{" "}
										student@library.sk
									</li>
									<li className="text-xs mt-2 text-blue-600 dark:text-blue-300 flex items-center gap-1">
										<Key className="h-3 w-3" />
										Heslo: ŠtudiaKnihy123!
									</li>
								</ul>

								<div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
									<p className="text-xs text-blue-600 dark:text-blue-300">
										💡 Pre všetky demo účty použite rovnaké heslo
									</p>
									<p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
										Heslo obsahuje: veľké/malé písmená, číslicu a špeciálny znak
									</p>
								</div>
							</motion.div>

							{/* Bezpečnostné upozornenie */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.8 }}
								className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 p-3 border border-amber-200 dark:border-amber-800"
							>
								<p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
									<AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
									Po 5 neúspešných pokusoch bude účet dočasne zablokovaný na 15
									minút
								</p>
							</motion.div>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4 pt-2">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.9 }}
								className="w-full"
							>
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={!canSubmit || isSubmitting || isLoading}
										>
											{isLoading ? (
												<div className="flex items-center gap-2">
													<div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Prihlasujem...
												</div>
											) : (
												<div className="flex items-center gap-2">
													<LogIn className="h-5 w-5" />
													Prihlásiť sa
												</div>
											)}
										</Button>
									)}
								/>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1 }}
								className="text-sm text-center text-muted-foreground"
							>
								Nemáte účet?{" "}
								<button
									type="button"
									onClick={() => router.navigate({ to: "/register" })}
									className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
									disabled={isLoading}
								>
									Zaregistrovať sa
								</button>
							</motion.div>
						</CardFooter>
					</form>
				</Card>
			</motion.div>

			{/* Pomocné informácie */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.1 }}
				className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
			>
				<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
					<Sparkles className="h-4 w-4" />
					Rýchla pomoc:
				</h3>
				<ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
					<li>Pri prvom prihlásení použite demo údaje vyššie</li>
					<li>Ak ste zabudli heslo, kontaktujte administrátora</li>
					<li>Účty s rolou "Admin" majú prístup k administrácii</li>
					<li>Pre bezpečnosť odporúčame zmeniť heslo po prvom prihlásení</li>
				</ul>
			</motion.div>
		</div>
	);
};

export default LoginForm;
