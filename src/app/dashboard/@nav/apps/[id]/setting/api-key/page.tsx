'use client'

import { trpcClientReact } from "@/utils/api";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function AppDashboardNav({ params }: { params: Promise<{ id: string }> }) {
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery()

  const { id } = use(params);

  const currentApp = apps?.filter(app => app.id === id)[0]

  return (
    <div className="flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            {
              isPending ? 'Loading...' : currentApp ? currentApp.name : '...'
            }
          </Button>

        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {
            apps?.map(app => {
              return <DropdownMenuItem key={app.id} disabled={app.id === id}>
                <Link href={`/dashboard/apps/${app.id}`}>
                  {app.name}
                </Link>
              </DropdownMenuItem>
            })
          }
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        {` / api Keys`}
      </div>
    </div>
  )
}