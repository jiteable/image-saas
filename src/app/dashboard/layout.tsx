import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return <>{children}</>
}
