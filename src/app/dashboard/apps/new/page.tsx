import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAppSchema } from "@/server/db/validate-schema";
import { redirect } from "next/navigation";
import { serverCaller } from "@/utils/trpc";
import { getServerSession } from "next-auth";
import { SubmitButton } from "./SubmitButton";

export default function CreateApp() { // 添加 async 关键字

  async function createApp(formData: FormData) {
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

      const newApp = await serverCaller({ session }).apps.createApp(input.data)

      redirect(`/dashboard/apps/${newApp.id}`)
    } else {
      throw input.error
    }

  }

  return (
    <div className="w-full">
      <form className="w-full flex flex-col gap-4" action={createApp}>
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name" minLength={3} required></Input>
        <Textarea
          name="description"
          placeholder="Description"
          className="min-h-[120px]"
        ></Textarea>
        <SubmitButton></SubmitButton>
      </form>
    </div>
  );
}