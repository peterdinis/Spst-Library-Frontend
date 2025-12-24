import { FC, Key } from "react";
import { useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Mail,
	Lock,
	User,
	UserPlus,
	BookOpen,
	Sparkles,
	Shield,
	CheckCircle,
	AlertCircle,
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
import { useMutation } from "@tanstack/react-query";
import { type RegisterInput } from "@/api/authApi";
import { toast } from "sonner";
import { registerUser } from "@/functions/auth/authFunctions";
import { useForm } from "@tanstack/react-form";

const RegisterForm: FC = () => {
	const router = useRouter();

	const registerMutation = useMutation({
		mutationFn: (data: RegisterInput) => registerUser({ data }),
		onSuccess: (response) => {
			if (response.success) {
				toast("Registrácia úspešná!", {
					description: "Váš účet bol úspešne vytvorený.",
					className: "bg-emerald-600 text-white",
				});

				setTimeout(() => {
					router.navigate({ to: "/login" });
				}, 2000);
			} else {
				toast.error("Registrácia zlyhala", {
					description: response.message || "Pri registrácii nastala chyba",
				});
			}
		},
		onError: (error: any) => {
			// Vylepšený error handling pre password validation
			if (error?.data) {
				const passwordErrors = error.data.filter((err: any) =>
					err.code?.includes("Password"),
				);

				if (passwordErrors.length > 0) {
					const errorMessages = passwordErrors.map((err: any) => {
						switch (err.code) {
							case "PasswordRequiresNonAlphanumeric":
								return "Heslo musí obsahovať aspoň jeden špeciálny znak (napr. !, @, #, $)";
							case "PasswordRequiresDigit":
								return "Heslo musí obsahovať aspoň jednu číslicu (0-9)";
							case "PasswordRequiresLower":
								return "Heslo musí obsahovať aspoň jedno malé písmeno (a-z)";
							case "PasswordRequiresUpper":
								return "Heslo musí obsahovať aspoň jedno veľké písmeno (A-Z)";
							case "PasswordTooShort":
								return "Heslo musí mať aspoň 6 znakov";
							default:
								return err.description;
						}
					});

					toast.error("Chyba hesla", {
						description: (
							<ul className="list-disc list-inside space-y-1">
								{errorMessages.map(
									(msg: string, idx: Key | null | undefined) => (
										<li key={idx}>{msg}</li>
									),
								)}
							</ul>
						),
					});
					return;
				}

				// Ak sú iné chyby
				const errorMessage =
					error.data[0]?.description || "Nastala neznáma chyba";
				toast.error("Chyba registrácie", {
					description: errorMessage,
				});
				return;
			}

			// Generická chyba
			toast.error("Chyba", {
				description: error.message || "Pri registrácii nastala chyba",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "Student" as "Student" | "Teacher" | "Admin",
		},
		onSubmit: async ({ value }) => {
			const { confirmPassword, ...registrationData } = value;
			registerMutation.mutate(registrationData);
		},
	});

	const isLoading = registerMutation.isPending;

	// Funkcia pre zobrazenie detailnej chyby
	const renderErrorDetails = () => {
		if (!registerMutation.error?.data) return null;

		const errors = registerMutation.error.data;
		const passwordErrors = errors.filter((err: any) =>
			err.code?.includes("Password"),
		);
		const otherErrors = errors.filter(
			(err: any) => !err.code?.includes("Password"),
		);

		return (
			<div className="space-y-4">
				{passwordErrors.length > 0 && (
					<div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
							<div className="space-y-2">
								<p className="font-medium text-red-800 dark:text-red-300">
									Heslo nezodpovedá požiadavkám:
								</p>
								<ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
									{passwordErrors.map((err: any, idx: number) => {
										let message = err.description;
										if (err.code === "PasswordRequiresNonAlphanumeric") {
											message =
												"Musí obsahovať špeciálny znak (!, @, #, $, %, atď.)";
										} else if (err.code === "PasswordRequiresDigit") {
											message = "Musí obsahovať aspoň jednu číslicu (0-9)";
										} else if (err.code === "PasswordRequiresLower") {
											message = "Musí obsahovať aspoň jedno malé písmeno";
										} else if (err.code === "PasswordRequiresUpper") {
											message = "Musí obsahovať aspoň jedno veľké písmeno";
										}
										return <li key={idx}>{message}</li>;
									})}
								</ul>
							</div>
						</div>
					</div>
				)}

				{otherErrors.length > 0 && (
					<div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
							<div>
								<p className="font-medium text-yellow-800 dark:text-yellow-300">
									Ďalšie chyby:
								</p>
								<ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
									{otherErrors.map((err: any, idx: number) => (
										<li key={idx}>{err.description}</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				)}
			</div>
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
					<div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
					<div className="relative bg-gradient-to-br from-emerald-600 to-cyan-600 p-4 rounded-2xl shadow-2xl">
						<BookOpen className="h-12 w-12 text-white" />
					</div>
				</div>
			</motion.div>

			{registerMutation.data?.success && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6"
				>
					<div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-800">
						<div className="flex items-center gap-3">
							<CheckCircle className="h-5 w-5 text-emerald-600" />
							<div>
								<p className="font-medium text-emerald-800 dark:text-emerald-300">
									Registrácia úspešná!
								</p>
								<p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
									Budete presmerovaný na prihlásenie...
								</p>
							</div>
						</div>
					</div>
				</motion.div>
			)}

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
							<CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
								Vytvoriť účet
							</CardTitle>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<CardDescription className="text-center text-base">
								Zaregistrujte sa a začnite objavovať knihy
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
						<CardContent className="space-y-5">
							{/* Zobrazenie detailných chýb z API */}
							{registerMutation.error?.data && renderErrorDetails()}

							{/* Generická chybová hláška */}
							{registerMutation.error && !registerMutation.error?.data && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: -10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
								>
									<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
									<div className="ml-3">
										<p className="text-sm font-medium text-red-800 dark:text-red-300">
											Chyba pri registrácii
										</p>
										<p className="text-sm text-red-700 dark:text-red-400 mt-1">
											{registerMutation.error.message}
										</p>
									</div>
								</motion.div>
							)}

							{/* Meno a priezvisko */}
							<form.Field
								name="fullName"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim()) return "Meno a priezvisko sú povinné";
										if (value.length < 2) return "Meno musí mať aspoň 2 znaky";
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
											<Sparkles className="h-3 w-3 text-emerald-600" />
											Meno a priezvisko
										</label>
										<div className="relative">
											<User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="Janko Mrkvička"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												}`}
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
										transition={{ delay: 0.5 }}
										className="space-y-2"
									>
										<label
											htmlFor={field.name}
											className="text-sm font-semibold flex items-center gap-2"
										>
											<Sparkles className="h-3 w-3 text-cyan-600" />
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
												className={`pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												}`}
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

										// Frontend validácia podľa backendových pravidiel
										const errors = [];
										if (!/[0-9]/.test(value))
											errors.push("aspoň jednu číslicu");
										if (!/[a-z]/.test(value))
											errors.push("aspoň jedno malé písmeno");
										if (!/[A-Z]/.test(value))
											errors.push("aspoň jedno veľké písmeno");
										if (!/[^a-zA-Z0-9]/.test(value))
											errors.push("aspoň jeden špeciálny znak");

										if (errors.length > 0) {
											return `Heslo musí obsahovať: ${errors.join(", ")}`;
										}
										return undefined;
									},
								}}
								children={(field) => (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.6 }}
										className="space-y-2"
									>
										<label
											htmlFor={field.name}
											className="text-sm font-semibold flex items-center gap-2"
										>
											<Sparkles className="h-3 w-3 text-emerald-600" />
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
												className={`pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												}`}
												disabled={isLoading}
											/>
										</div>
										{field.state.meta.errors &&
											field.state.meta.errors.length > 0 && (
												<p className="text-sm text-red-500 italic">
													{field.state.meta.errors.join(", ")}
												</p>
											)}
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Heslo musí obsahovať aspoň 6 znakov: veľké a malé písmená,
											číslicu a špeciálny znak
										</p>
									</motion.div>
								)}
							/>

							{/* Potvrdenie hesla */}
							<form.Field
								name="confirmPassword"
								validators={{
									onChangeListenTo: ["password"],
									onChange: ({ value, fieldApi }) => {
										if (!value.trim()) return "Potvrdenie hesla je povinné";
										const password = fieldApi.form.getFieldValue("password");
										if (value && password && value !== password) {
											return "Heslá sa nezhodujú";
										}
										return undefined;
									},
								}}
								children={(field) => (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.7 }}
										className="space-y-2"
									>
										<label
											htmlFor={field.name}
											className="text-sm font-semibold flex items-center gap-2"
										>
											<Sparkles className="h-3 w-3 text-cyan-600" />
											Potvrdiť heslo
										</label>
										<div className="relative">
											<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0
														? "border-red-500 focus:border-red-500"
														: ""
												}`}
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

							{/* Výber roly */}
							<form.Field
								name="role"
								children={(field) => (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.8 }}
										className="space-y-2"
									>
										<label className="text-sm font-semibold flex items-center gap-2">
											<Sparkles className="h-3 w-3 text-emerald-600" />
											Rola (voliteľné)
										</label>
										<div className="grid grid-cols-3 gap-2">
											{["Student", "Teacher"].map((role) => (
												<button
													key={role}
													type="button"
													onClick={() => field.handleChange(role as any)}
													disabled={isLoading}
													className={`p-3 rounded-lg border-2 transition-all ${
														field.state.value === role
															? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
															: "border-gray-200 dark:border-gray-800 hover:border-emerald-400"
													} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
												>
													<span className="text-sm font-medium">
														{role === "Student" ? "Študent" : "Učiteľ"}
													</span>
												</button>
											))}
										</div>
									</motion.div>
								)}
							/>
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
											className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={!canSubmit || isSubmitting || isLoading}
										>
											<div className="flex items-center gap-2">
												<UserPlus className="h-5 w-5" />
												{isLoading ? "Registrujem..." : "Zaregistrovať sa"}
											</div>
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
								Už máte účet?{" "}
								<button
									type="button"
									onClick={() => router.navigate({ to: "/login" })}
									className="font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-cyan-700 transition-all"
									disabled={isLoading}
								>
									Prihlásiť sa
								</button>
							</motion.div>
						</CardFooter>
					</form>
				</Card>
			</motion.div>

			{/* Nápoveda pre heslo */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.1 }}
				className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
			>
				<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
					<Sparkles className="h-4 w-4" />
					Požiadavky na heslo:
				</h3>
				<ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
					<li>Aspoň 6 znakov</li>
					<li>Aspoň jedno veľké písmeno (A-Z)</li>
					<li>Aspoň jedno malé písmeno (a-z)</li>
					<li>Aspoň jednu číslicu (0-9)</li>
					<li>Aspoň jeden špeciálny znak (!@#$%^&*...)</li>
				</ul>
			</motion.div>
		</div>
	);
};

export default RegisterForm;
