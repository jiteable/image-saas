/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { Plan } from "./Plan";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { trpcClientReact } from "@/utils/api";
import { toast } from "sonner";
import { Session } from "next-auth";

export default function DashboardLayoutClient(props: {
  children: React.ReactNode;
  nav: React.ReactNode;
  session: Session;
}) {
  const { children, nav } = props;

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
                <UserProfileWrapper />
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

function UserProfileWrapper() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return <UserProfile user={session.user} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserProfile({ user }: { user: any }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const [displayName, setDisplayName] = useState(user.name || "");
  const utils = trpcClientReact.useUtils();
  const { update } = useSession();
  const { mutate: updateName, isPending } = trpcClientReact.user.updateName.useMutation({
    onSuccess: async (data) => {
      // 更新成功后，刷新会话数据
      utils.invalidate();
      // 使用 NextAuth 的 update 方法更新会话中的用户信息
      await update({
        ...user,
        name: data.name
      });
      // 立即更新本地状态以反映在UI上
      setDisplayName(data.name);
      setIsEditingName(false);
      toast.success("Name updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update name: ${error.message}`);
    }
  });

  // 当用户会话更新时同步显示名称
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }
  }, [session?.user?.name]);

  const handleUpdateName = () => {
    if (newName.trim() && newName !== user.name) {
      updateName({ name: newName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.image!}
                alt={user.name || "User profile"}
              ></AvatarImage>
              <AvatarFallback>
                {displayName?.substring(0, 2) || "U"}
              </AvatarFallback>
            </Avatar>
            <Plan></Plan>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="h-8"
                  disabled={isPending}
                  autoFocus
                />
              </div>
            ) : (
              <p
                className="text-sm font-medium leading-none cursor-pointer hover:underline"
                onClick={() => {
                  setIsEditingName(true);
                  setNewName(displayName || "");
                }}
              >
                {displayName}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isEditingName ? (
            <>
              <DropdownMenuItem onClick={handleUpdateName} disabled={isPending}>
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditingName(false)}>
                Cancel
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                Update Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}>
                Log out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}