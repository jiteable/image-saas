import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

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
    <DashboardLayoutClient session={session} nav={nav}>
      {children}
    </DashboardLayoutClient>
  );
}