import { FC } from "react";
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
import { registerSchema, type RegisterInput } from "@/api/authApi";
import { toast } from "sonner";
import { registerUser } from "@/functions/auth/authFunctions";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

const RegisterForm: FC = () => {
	const router = useRouter();

	// TanStack Query mutation for registration
	const registerMutation = useMutation({
		mutationFn: (data: RegisterInput) => registerUser({ data }),
		onSuccess: (response) => {
			if (response.success) {
				toast("Registration successful!", {
					description: "Your account has been successfully created.",
					className: "bg-emerald-600 text-white",
				});

				// Automatically redirect to login after 2 seconds
				setTimeout(() => {
					router.navigate({ to: "/login" });
				}, 2000);
			} else {
				toast.error("Registration failed", {
					description: "An error occurred during registration",
				});
			}
		},
		onError: (error: Error) => {
			toast.error("Error", {
				description: error.message,
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
			// Validate passwords match manually or via schema refinement if possible
			// Here we are using Zod adapter so we can reuse the schema but confirmPassword complicates it slightly
			// for the mutation payload. 
			// We'll strip confirmPassword before sending.

			const { confirmPassword, ...registrationData } = value;

			// Trigger mutation
			registerMutation.mutate(registrationData);
		},
		validatorAdapter: zodValidator(),
		validators: {
			onChange: registerSchema.extend({
				confirmPassword: z.string().min(6, "Password confirmation is required")
			}).refine((data) => data.password === data.confirmPassword, {
				message: "Passwords don't match",
				path: ["confirmPassword"],
			}),
		}
	});


	const isLoading = registerMutation.isPending;

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

			{/* Success message */}
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
									Registration successful!
								</p>
								<p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
									You will be redirected to login...
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
							<CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
								Create an account
							</CardTitle>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<CardDescription className="text-center text-base">
								Register and start exploring books
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
							{/* General error */}
							{registerMutation.error && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: -10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									className="relative overflow-hidden rounded-lg p-4 bg-linear-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
								>
									<div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-red-500 to-pink-500"></div>
									<p className="text-sm text-red-700 dark:text-red-300 ml-3">
										{registerMutation.error.message}
									</p>
								</motion.div>
							)}

							{/* Full Name Field */}
							<form.Field
								name="fullName"
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
											Full Name
										</label>
										<div className="relative group">
											<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
											<User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-emerald-600" />
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="John Doe"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 ${field.state.meta.errors.length ? "border-red-500 focus:border-red-500" : ""
													}`}
												required
											/>
										</div>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</motion.div>
								)}
							/>

							{/* Email Field */}
							<form.Field
								name="email"
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
										<div className="relative group">
											<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-cyan-600" />
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="your@email.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 ${field.state.meta.errors.length ? "border-red-500 focus:border-red-500" : ""
													}`}
												required
											/>
										</div>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</motion.div>
								)}
							/>

							{/* Password Field */}
							<form.Field
								name="password"
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
											Password
										</label>
										<div className="relative group">
											<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-emerald-600" />
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 ${field.state.meta.errors.length ? "border-red-500 focus:border-red-500" : ""
													}`}
												required
											/>
										</div>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</motion.div>
								)}
							/>

							{/* Confirm Password Field */}
							<form.Field
								name="confirmPassword"
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
											Confirm Password
										</label>
										<div className="relative group">
											<div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
											<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-cyan-600" />
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 ${field.state.meta.errors.length ? "border-red-500 focus:border-red-500" : ""
													}`}
												required
											/>
										</div>
										{field.state.meta.errors ? (
											<p className="text-sm text-red-500">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</motion.div>
								)}
							/>

							{/* Role Selection (optional) */}
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
											Role (optional)
										</label>
										<div className="grid grid-cols-3 gap-2">
											{["Student", "Teacher", "Admin"].map((role) => (
												<button
													key={role}
													type="button"
													onClick={() => field.handleChange(role as any)}
													className={`p-3 rounded-lg border-2 transition-all ${field.state.value === role
														? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
														: "border-gray-200 dark:border-gray-800 hover:border-emerald-400"
														}`}
												>
													<span className="text-sm font-medium">{role}</span>
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
											className="w-full h-12 text-base font-semibold bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
											disabled={!canSubmit || isSubmitting || isLoading}
										>
											<div className="flex items-center gap-2">
												<UserPlus className="h-5 w-5" />
												Register
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
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => router.navigate({ to: "/login" })}
									className="font-semibold bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-cyan-700 transition-all"
								>
									Log in
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