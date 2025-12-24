import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, LogIn, Home } from "lucide-react";

const Unauthorized403 = () => {
	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full"
			>
				{/* Hlavný obsah */}
				<motion.div
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.4 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
				>
					{/* Ikonka */}
					<motion.div
						initial={{ rotate: -10, scale: 0 }}
						animate={{ rotate: 0, scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 10,
							delay: 0.1,
						}}
						className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full mb-6"
					>
						<AlertTriangle className="w-10 h-10 text-red-500" />
					</motion.div>

					{/* Kód chyby */}
					<motion.h1
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="text-8xl font-bold text-gray-800 dark:text-white mb-2"
					>
						403
					</motion.h1>

					{/* Nadpis */}
					<motion.h2
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4"
					>
						Prístup zamietnutý
					</motion.h2>

					{/* Správa */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="text-gray-600 dark:text-gray-400 mb-8"
					>
						K tejto stránke nemáte prístup, pretože nie ste prihlásení.
						<br />
						Prosím, prihláste sa pre pokračovanie.
					</motion.p>

					{/* Animované tlačidlá */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Link
								to="/login"
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
							>
								<LogIn className="w-5 h-5" />
								Prihlásiť sa
							</Link>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Link
								to="/"
								className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
							>
								<Home className="w-5 h-5" />
								Domov
							</Link>
						</motion.div>
					</div>
				</motion.div>

				{/* Dekoratívne prvky */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm"
				>
					<p>© {new Date().getFullYear()} Vaša Aplikácia</p>
				</motion.div>
			</motion.div>

			{/* Animované pozadie */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute rounded-full bg-red-100 dark:bg-red-900/10"
						style={{
							width: Math.random() * 100 + 50,
							height: Math.random() * 100 + 50,
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, -20, 0],
							x: [0, Math.random() * 20 - 10, 0],
							rotate: [0, 180, 360],
						}}
						transition={{
							duration: Math.random() * 10 + 10,
							repeat: Infinity,
							ease: "linear",
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default Unauthorized403;
