import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db/db";

export default async function Home() { // 添加 async 关键字
  // 调用 findMany() 函数来执行查询
  const users = await db.query.Users.findMany(); // 添加 ()

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

      {
        users.map((user) => <div key={user.id}>{user.name}</div>) // 修正 JSX 语法
      }
    </div>
  );
}