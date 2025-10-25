"use client"

import { trpcClientReact } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useState } from "react"
export default async function ApiKeysPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const { data: apiKeys } = trpcClientReact.apiKeys.listapiKeys.useQuery({ appId: id })

  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery()

  const { mutate } = trpcClientReact.apiKeys.createApiKey.useMutation({
    onSuccess: (data) => {
      utils.apiKeys.listapiKeys.setData({ appId: id }, (prev) => {
        setNewApiKeyName("")
        if (!prev || !data) {
          return prev
        }

        return [data, ...prev]
      })
    }
  })

  const utils = trpcClientReact.useUtils()

  const currentApp = apps?.filter(app => app.id === id)[0]

  const [newApiKeyName, setNewApiKeyName] = useState("")

  return <div className="pt-10">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl mb-6">Api Keys</h1>
      <Popover>
        <PopoverTrigger asChild>
          <Button>
            <Plus />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-4">
            <Input placeholder="Name" onChange={(e) => {
              setNewApiKeyName(e.target.value)
            }}></Input>
            <Button type="submit" onClick={() => {
              mutate({
                appId: id,
                name: newApiKeyName
              })
            }}>Submit</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
    {apiKeys?.map(apiKey => {
      return <div key={apiKey.id} className="border p-4 flex justify-center items-center">
        <span>
          {apiKey.name}
        </span>
        <span>
          {apiKey.key}
        </span>
      </div>
    })}
  </div>
}