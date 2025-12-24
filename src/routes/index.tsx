import { NotFoundComponent } from "@/components/shared/NotFoundComponent";
import { ErrorComponent } from "@/components/shared/ErrorComponent";
import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Footer from "@/components/shared/Footer";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";

export const Route = createFileRoute("/")({
  component: App,
  pendingComponent: () => <DashboardSkeleton />,
  errorComponent: () => {
    return <ErrorComponent error={"Nepodarilo sa načítať hlavnú stránku"} />;
  },
  notFoundComponent: () => {
    return <NotFoundComponent message="Táto stránka neexistuje" />;
  },
  loader: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {};
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