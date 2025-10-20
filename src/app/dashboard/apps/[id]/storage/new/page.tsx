"use client"

import { Input } from "@/components/ui/input"
import { S3StorageConfiguration } from "@/server/db/schema"
import { SubmitHandler, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { trpcClientReact } from "@/utils/api"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"
export default function StoragePage({ params: { id } }: { params: { id: string } }) {

  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<S3StorageConfiguration & { name: string }>()

  const { mutate } = trpcClientReact.storages.createStorage.useMutation()
  const onSubmit: SubmitHandler<S3StorageConfiguration & { name: string }> = (data) => {
    console.log('submit')
    mutate(data)
    router.push(`/dashboard/apps/${id}/storage`)
  }

  return <div className="container pt-10">
    <h1 className="text-3xl mb-6 max-w-md mx-auto">Create Storage</h1>
    <form action="" className="flex flex-col gap-4 max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name', {
          required: 'Name is required'
        })} ></Input>
        <span className="text-red-500">{errors.name?.message}</span>
      </div>
      <div>
        <Label htmlFor="bucket">Bucket</Label>
        <Input id="bucket" {...register('bucket', {
          required: 'Bucket is required'
        })}></Input>
        <span className="text-red-500">{errors.bucket?.message}</span>
      </div>
      <div>
        <Label htmlFor="accessKeyId">Access Key ID</Label>
        <Input id="accessKeyId" {...register('assessKeyId', {
          required: 'AccessKeyId is required'
        })}></Input>
        <span className="text-red-500">{errors.assessKeyId?.message}</span>
      </div>
      <div>
        <Label htmlFor="region">Region</Label>
        <Input id="region" {...register("region", {
          required: 'Region is required'
        })}></Input>
        <span className="text-red-500">{errors.region?.message}</span>
      </div>
      <div>
        <Label htmlFor="secretAccessKey">Secret Access Key</Label>
        <Input id="secretAccessKey" type="password" {...register("secretAccessKey", {
          required: 'SecretAccessKey is required'
        })}></Input>
        <span className="text-red-500">{errors.secretAccessKey?.message}</span>
      </div>
      <div>
        <Label htmlFor="apiEndpoint">API Endpoint</Label>
        <Input id="apiEndpoint" {...register("apiEndpoint", {
          required: 'apiEndpoint is required'
        })}></Input>
        <span className="text-red-500">{errors.apiEndpoint?.message}</span>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  </div >
}
