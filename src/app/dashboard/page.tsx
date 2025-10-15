import { createTRPCContext, serverCaller } from "@/utils/trpc";
export default async function Home() { // 添加 async 关键字

  const context = await createTRPCContext()
  const data = await serverCaller(context).hello()

  return (
    <div className="h-screen flex justify-center items-center">
      Dashboard {data.hello}
    </div>
  );
}