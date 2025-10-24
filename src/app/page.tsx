import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAppSchema } from "@/server/db/validate-schema";
import { redirect } from "next/navigation";
import { serverCaller } from "@/utils/trpc";
import { getServerSession } from "next-auth";
import { SubmitButton } from "../components/SubmitButton";
import { authOptions } from "@/server/auth";

export default function CreateApp() {

  async function createApp(formData: FormData) {
    'use server'

    try {
      const name = formData.get('name')
      const description = formData.get('description')

      const input = createAppSchema.pick({ name: true, description: true }).safeParse({
        name, description
      })

      if (input.success) {
        const session = await getServerSession(authOptions)

        // 添加空值检查
        if (!session) {
          throw new Error("Unauthorized: No session found")
          // 或者重定向到登录页面
          // redirect("/login")
        }

        const newApp = await serverCaller({ session }).apps.createApp(input.data)

        redirect(`/dashboard/apps/${newApp.id}`)
      } else {
        console.error("Validation error:", input.error);
        // 可以将错误信息传递给客户端显示
        throw new Error("Validation failed");
      }
    } catch (error) {
      console.error("Failed to create app:", error);
      // 错误处理，可以重定向到错误页面或显示错误信息
      throw error;
    }
  }

  return (
    <div className="h-full flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4" action={createApp}>
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name" minLength={3} required></Input>
        <Textarea
          name="description"
          placeholder="Description"
        ></Textarea>
        <SubmitButton></SubmitButton>
      </form>
    </div>
  );
}