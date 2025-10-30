import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
export default async function DashBoardLayout({
  children,
  nav
}: Readonly<{
  children: React.ReactNode;
  nav: React.ReactNode
}>) {

  const session = await getServerSession()

  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  return <ThemeProvider>
    <div className="h-screen">
      <nav className="h-[80px]  border-b relative">
        <div className="flex justify-end items-center h-full container gap-2">
          <ThemeToggle></ThemeToggle>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={session.user?.image ?? undefined}></AvatarImage>
                <AvatarFallback>{session.user?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session.user?.name ?? ""}</DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute top-0 h-full left-1/2 -translate-x-1/2 flex justify-center items-center">
          {nav}
        </div>
      </nav>
      <main className="h-[calc(100% - 80px)]">
        {children}
      </main>

    </div>
  </ThemeProvider>
}