import ProfileWrapper from "@/components/auth/ProfileWrapper";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import { NotFoundComponent } from "@/components/shared/NotFoundComponent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
	component: ProfileWrapper,
	pendingComponent: DashboardSkeleton,
	notFoundComponent: () => (
		<NotFoundComponent message="Nepodarilo sa načítať profil" />
	),
});
