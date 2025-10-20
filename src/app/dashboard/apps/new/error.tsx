"use client"
import { Button } from "@/components/ui/button"
export default function CreateAppError({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div>
      <div className="w-64 mx-auto p-8 flex justify-center items-center flex-col">
        <span>Create App Faild</span>
        <Button onClick={reset}></Button>
      </div>
    </div>
  )

}