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
      <div className="h-screen">
        <nav className="h-[80px] border-b relative">
          <div className="container flex gap-2 justify-end items-center h-full">
            <ThemeToggle></ThemeToggle>
            <DropdownMenu>
              <DropdownMenuTrigger>
                {/* <Button variant="ghost"> */}
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={session.user.image!}
                    ></AvatarImage>
                    <AvatarFallback>
                      {session.user.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Plan></Plan>
                </div>
                {/* </Button> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  {session.user.name}
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className=" absolute top-0 h-full left-1/2 -translate-x-1/2 flex justify-center items-center">
            {nav}
          </div>
        </nav>
        <main className="h-[calc(100%-80px)]">{children}</main>
      </div>
    </ThemeProvider>
  );
}