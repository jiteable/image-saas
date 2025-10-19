import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createAppSchema } from "@/server/db/validate-schema";
import { redirect } from "next/navigation";
import { serverCaller } from "@/utils/trpc";
import { getServerSession } from "next-auth";

export default async function Home() { // 添加 async 关键字

  function createApp(formData: FormData) {
    'use server'

    const name = formData.get('name')
    const description = formData.get('description')

    const input = createAppSchema.pick({ name: true, description: true }).safeParse({
      name, description
    })

    if (input.success) {

      const session = getServerSession()

      // 添加空值检查
      if (!session) {
        throw new Error("Unauthorized: No session found")
        // 或者重定向到登录页面
        // redirect("/login")
      }

      const newApp = serverCaller({ session }).apps.createApp(input.data)

      redirect(`/dashboard/apps/${newApp.id}`)
    }

  }

  return (
    <div className="h-screen flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4" action={createApp}>
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name"></Input>
        <Textarea
          name="description"
          placeholder="Description"
        ></Textarea>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}