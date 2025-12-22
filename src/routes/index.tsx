import { NotFoundComponent } from "@/components/shared/NotFoundComponent";
import { ErrorComponent } from "@/components/shared/ErrorComponent";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Footer from "@/components/shared/Footer";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";

export const Route = createFileRoute("/")({
	ssr: false,
	component: App,
	pendingComponent: () => <DashboardSkeleton />,
	loader: () => {
		<Loader2 className="animate-spin w-8 h-8" />;
	},
	errorComponent: () => {
		<ErrorComponent error={"Nepodarilo sa načítať hlavnú stránku"} />;
	},
	notFoundComponent: () => {
		<NotFoundComponent message="Táto stránka neexistuje" />;
	},
});

function App() {
	return (
		<>
			<Hero />
			<Services />
			<Footer />
		</>
	);
}
