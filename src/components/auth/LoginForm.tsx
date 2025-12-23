import { FC } from "react";
import { useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, BookOpen, Sparkles } from "lucide-react";
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

const LoginForm: FC = () => {
	const router = useRouter();

	const loginMutation = useMutation({
		mutationFn: (data: LoginInput) => loginUser({ data }),
		onSuccess: (response) => {
			if (response.success) {
				toast.success("Login successful!", {
					description: "Welcome back!",
				});

				router.navigate({ to: "/profile" });
			} else {
				toast.error("Login failed", {
					description: response.message || "Invalid credentials",
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
			email: "",
			password: "",
			rememberMe: false,
		},
		onSubmit: async ({ value }) => {
			loginMutation.mutate(value);
		},
	});

	const isLoading = loginMutation.isPending;

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
								Welcome back
							</CardTitle>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<CardDescription className="text-center text-base">
								Log in to your account and continue reading
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
							{loginMutation.error && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: -10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800"
								>
									<div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-pink-500"></div>
									<p className="text-sm text-red-700 dark:text-red-300 ml-3">
										{loginMutation.error.message}
									</p>
								</motion.div>
							)}

							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) => {
										const result = loginSchema.shape.email.safeParse(value);
										return result.success ? undefined : result.error.issues[0].message;
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
												placeholder="your@email.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className={`pl-11 h-12 border-2 transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 relative z-20 ${
													field.state.meta.errors?.length > 0 ? "border-red-500 focus:border-red-500" : ""
												}`}
											/>
										</div>
										{field.state.meta.errors && field.state.meta.errors.length > 0 && (
											<p className="text-sm text-red-500 italic">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</motion.div>
								)}
							/>

							<form.Field
								name="password"
								validators={{
									onChange: ({ value }) => {
										const result = loginSchema.shape.password.safeParse(value);
										return result.success ? undefined : result.error.issues[0].message;
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
											Password
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
													field.state.meta.errors?.length > 0 ? "border-red-500 focus:border-red-500" : ""
												}`}
											/>
										</div>
										{field.state.meta.errors && field.state.meta.errors.length > 0 && (
											<p className="text-sm text-red-500 italic">
												{field.state.meta.errors.join(", ")}
											</p>
										)}
									</motion.div>
								)}
							/>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6 }}
								className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 border border-blue-100 dark:border-blue-900"
							>
								<p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
									Demo accounts:
								</p>
								<ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-200">
									<li className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
										<span className="font-medium">Admin:</span> admin@library.sk
									</li>
									<li className="flex items-center gap-2">
										<div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
										<span className="font-medium">User:</span>{" "}
										user@library.sk
									</li>
									<li className="text-xs mt-2 text-blue-600 dark:text-blue-300">
										💡 Password: any
									</li>
								</ul>
							</motion.div>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4 pt-2">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.7 }}
								className="w-full"
							>
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
											disabled={!canSubmit || isSubmitting || isLoading}
										>
											{isLoading ? (
												<div className="flex items-center gap-2">
													<div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Logging in...
												</div>
											) : (
												<div className="flex items-center gap-2">
													<LogIn className="h-5 w-5" />
													Log in
												</div>
											)}
										</Button>
									)}
								/>
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.8 }}
								className="text-sm text-center text-muted-foreground"
							>
								Don't have an account?{" "}
								<button
									type="button"
									onClick={() => router.navigate({ to: "/register" })}
									className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
								>
									Sign up
								</button>
							</motion.div>
						</CardFooter>
					</form>
				</Card>
			</motion.div>
		</div>
	);
};

export default LoginForm;