import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
	return (
		<div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
			<div className="space-y-3">
				<div className="flex space-x-4">
					<Skeleton className="h-32 w-24 rounded-lg" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-1/3" />
						<div className="flex items-center space-x-2 pt-2">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					</div>
				</div>
				<div className="flex justify-between items-center pt-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-20 rounded-md" />
				</div>
			</div>
		</div>
	);
};

export default DashboardSkeleton;
