"use client";

import Link from "next/link";
import { trpcClientReact } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardAppList() {
    const getAppsResult = trpcClientReact.apps.listApps.useQuery(void 0, {
        gcTime: Infinity,
        staleTime: Infinity,
    });

    const { data: apps, isLoading } = getAppsResult;

    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Applications</h1>
                <Button asChild size="lg">
                    <Link
                        href="/dashboard/apps/new"
                        onClick={(e) => {
                            e.preventDefault();
                            router.push("/dashboard/apps/new");
                        }}
                    >
                        Create New App
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : apps && apps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps?.map((app) => (
                        <div
                            key={app.id}
                            className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 bg-card"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                                    <p className="text-muted-foreground">
                                        {app.description
                                            ? app.description
                                            : "(no description)"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button asChild>
                                    <Link href={`/dashboard/apps/${app.id}`}>
                                        Open App
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Get started by creating your first application.
                    </p>
                    <Button asChild size="lg">
                        <Link
                            href="/dashboard/apps/new"
                            onClick={(e) => {
                                e.preventDefault();
                                router.push("/dashboard/apps/new");
                            }}
                        >
                            Create Your First App
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}