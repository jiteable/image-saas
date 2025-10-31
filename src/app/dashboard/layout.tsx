import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { Plan } from "./Plan";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  nav: React.ReactNode;
}) {
  const { children, nav } = props;
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <nav className="h-[80px] border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto h-full">
            <div className="flex gap-4 justify-between items-center h-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-xl font-bold">
                  ImageSaaS
                </Link>
              </div>

              <div className="flex-1 flex justify-center">
                {nav}
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle></ThemeToggle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={session.user.image!}
                            alt={session.user.name || "User profile"}
                          ></AvatarImage>
                          <AvatarFallback>
                            {session.user.name?.substring(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Plan></Plan>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}