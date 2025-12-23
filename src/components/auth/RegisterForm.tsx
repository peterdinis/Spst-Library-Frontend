import { FC, useState } from "react";
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

const RegisterForm: FC = () => {
	const router = useRouter();
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Validation
		if (formData.password !== formData.confirmPassword) {
			setError("Heslá sa nezhodujú");
			return;
		}

		if (formData.password.length < 6) {
			setError("Heslo musí mať aspoň 6 znakov");
			return;
		}

		if (!formData.email.includes("@")) {
			setError("Zadajte platný email");
			return;
		}

		setIsLoading(true);

		try {
			// TODO: Implementovať skutočnú registráciu
			console.log("Registrácia s:", formData);

			// Simulácia API volania
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Simulácia úspešnej registrácie
			if (formData.email && formData.password && formData.fullName) {
				// Uložiť používateľa do localStorage (placeholder)
				const users = JSON.parse(localStorage.getItem("users") || "[]");
				const newUser = {
					id: Date.now().toString(),
					fullName: formData.fullName,
					email: formData.email,
					createdAt: new Date().toISOString(),
				};

				users.push(newUser);
				localStorage.setItem("users", JSON.stringify(users));

				// Automaticky prihlásiť
				localStorage.setItem("isAuthenticated", "true");
				localStorage.setItem("userEmail", formData.email);
				localStorage.setItem("userName", formData.fullName);

				router.navigate({ to: "/" });
			} else {
				throw new Error("Vyplňte všetky povinné polia");
			}
		} catch (err: any) {
			setError(err.message || "Registrácia zlyhala");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = () => {
		router.navigate({ to: "/login" });
	};

	return (
		<div className="w-full max-w-md mx-auto mt-5">
			{/* Decorative elements */}
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="flex justify-center mb-8"
			>
				<div className="relative">
					<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
					<div className="relative bg-linear-to-br from-emerald-600 to-cyan-600 p-4 rounded-2xl shadow-2xl">
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
							<CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
								Vytvorte si účet
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

					<form onSubmit={handleSubmit}>
						<CardContent className="space-y-5">
							{error && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: -10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									className="relative overflow-hidden rounded-lg p-4 bg-linear-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
								>
									<div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-red-500 to-pink-500"></div>
									<p className="text-sm text-red-700 dark:text-red-300 ml-3">
										{error}
									</p>
								</motion.div>
							)}

							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 }}
								className="space-y-2"
							>
								<label
									htmlFor="fullName"
									className="text-sm font-semibold flex items-center gap-2"
								>
									<Sparkles className="h-3 w-3 text-emerald-600" />
									Celé meno
								</label>
								<div className="relative group">
									<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
									<User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-emerald-600" />
									<Input
										id="fullName"
										name="fullName"
										type="text"
										placeholder="Ján Novák"
										value={formData.fullName}
										onChange={handleChange}
										className="pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
										required
									/>
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 }}
								className="space-y-2"
							>
								<label
									htmlFor="email"
									className="text-sm font-semibold flex items-center gap-2"
								>
									<Sparkles className="h-3 w-3 text-cyan-600" />
									Email
								</label>
								<div className="relative group">
									<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-cyan-600" />
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="vas@email.sk"
										value={formData.email}
										onChange={handleChange}
										className="pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
										required
									/>
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.6 }}
								className="space-y-2"
							>
								<label
									htmlFor="password"
									className="text-sm font-semibold flex items-center gap-2"
								>
									<Sparkles className="h-3 w-3 text-emerald-600" />
									Heslo
								</label>
								<div className="relative group">
									<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-emerald-600" />
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="••••••••"
										value={formData.password}
										onChange={handleChange}
										className="pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
										required
										minLength={6}
									/>
								</div>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.7 }}
								className="space-y-2"
							>
								<label
									htmlFor="confirmPassword"
									className="text-sm font-semibold flex items-center gap-2"
								>
									<Sparkles className="h-3 w-3 text-cyan-600" />
									Potvrďte heslo
								</label>
								<div className="relative group">
									<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
									<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-cyan-600" />
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										placeholder="••••••••"
										value={formData.confirmPassword}
										onChange={handleChange}
										className="pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
										required
										minLength={6}
									/>
								</div>
							</motion.div>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4 pt-2">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="w-full"
							>
								<Button
									type="submit"
									className="w-full h-12 text-base font-semibold bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
									disabled={isLoading}
								>
									{isLoading ? (
										<div className="flex items-center gap-2">
											<div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Registrovanie...
										</div>
									) : (
										<div className="flex items-center gap-2">
											<UserPlus className="h-5 w-5" />
											Zaregistrovať sa
										</div>
									)}
								</Button>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.9 }}
								className="text-sm text-center text-muted-foreground"
							>
								Už máte účet?{" "}
								<button
									type="button"
									onClick={handleLogin}
									className="font-semibold bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-cyan-700 transition-all"
								>
									Prihláste sa
								</button>
							</motion.div>
						</CardFooter>
					</form>
				</Card>
			</motion.div>
		</div>
	);
};

export default RegisterForm;
