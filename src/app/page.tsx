import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db/db";
import { UserInfo, SessionProvider } from "./UserInfo";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() { // 添加 async 关键字

  const session = await getServerSession()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name"></Input>
        <Textarea
          name="description"
          placeholder="Description"
        ></Textarea>
        <Button type="submit">Submit</Button>
      </form>
      <SessionProvider>
        <UserInfo></UserInfo>
      </SessionProvider>

    </div>
  );
}