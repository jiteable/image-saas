/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Uppy } from "@uppy/core"
import AWSS3 from "@uppy/aws-s3"
import { ReactNode, useEffect, useState } from "react";
import { trpcClientReact, trpcPureClient } from "@/utils/api"
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/components/feature/UploadButton";
import { Dropzone } from "@/components/feature/Dropzone";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";
import { FileList } from "@/components/feature/FileList";
import { FilesOrderByColumn } from "@/server/routes/file";
import { MoveDown, MoveUp, Settings } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UrlMaker } from "./UrlMaker";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { id } from "zod/v4/locales";
import { setMaxIdleHTTPParsers } from "http";
import { UpgradeDialog } from "./Upgrade";
export default function AppPage({ params }: { params: Promise<{ id: string }> }) { // 添加 async 关键字

  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery(void 0, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const [makingUrlImageId, setmakingUrlImageId] = useState<string | null>(null)

  const currentApp = apps?.filter((app) => app.id === appId)[0]

  const { id: appId } = use(params);

  const [showUpgrade, setShowUpgrade] = useState(false)

  const [uppy] = useState<Uppy>(() => {
    const uppyInstance = new Uppy();
    uppyInstance.use(AWSS3, {
      shouldUseMultipart: false,
      async getUploadParameters(file) {

        try {
          const result = await trpcPureClient.file.createPresignedUrl.mutate({
            filename:
              file.data instanceof File ? file.data.name : "test",
            contentType: file.data.type || "",
            size: file.size ?? 0,
            appId: appId
          })

          return result
        } catch (err) {
          setShowUpgrade(true)
          throw err
        }
      }
    })
    return uppyInstance;
  });

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          name: file.name,
          type: file.type,
          data: file,
          size: file.size,
        }))
      )
    }
  })

  const [orderBy, setOrderBy] = useState<Exclude<FilesOrderByColumn, undefined>>({ field: "createdAt", order: 'desc' })

  let children: ReactNode

  if (isPending) {
    children = <div>Loading...</div>
  } else if (!currentApp) {
    children = <div className="flex flex-col mt-10 p-4 border rounded-md max-w-48 mx-auto items-center">
      <p className="text-lg">
        App Not Exist
      </p>
      <p className="text-sm">Chose another one</p>
      <div className="flex flex-col gap-4 items-center">
        {
          apps?.map((app) => (
            <Button key={app.id} asChild variant='link'>
              <Link href={`/dashboard/apps/${app.id}`}>{app.name}</Link>
            </Button>
          ))
        }
      </div>
    </div>
  } else {
    children = <div className="mx-auto h-full">
      <div className="flex container justify-between items-center h-[60px]">
        <Button onClick={() => {
          setOrderBy(current => ({
            ...current,
            order: current?.order === 'asc' ? 'desc' : 'asc'
          }))
        }}>Created At {orderBy.order === "desc" ? <MoveUp /> : <MoveDown />}</Button>
        <div className="flex justify-center gap-2">
          <UploadButton uppy={uppy}></UploadButton>
          <Button asChild>
            <Link href="/dashboard/apps/new">
              new App
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/apps/${appId}/setting/storage`}>
              <Settings />
            </Link>
          </Button>
        </div>
      </div>
      <Dropzone uppy={uppy} className="relative h-[clac(100% - 60px)]">
        {
          (draging) => {
            return <> {
              draging && (
                <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center">
                  Drop File Here to Upload
                </div>)
            }

              <FileList appId={appId} uppy={uppy} orderBy={orderBy} onMakeUrl={(id) => setmakingUrlImageId(id)}></FileList>
            </>
          }
        }
      </Dropzone>

      <UploadPreview uppy={uppy}></UploadPreview>
      <Dialog open={Boolean(makingUrlImageId)} onOpenChange={(flag) => {
        if (flag === false) {
          setmakingUrlImageId(null)
        }
      }}>
        <DialogContent className="max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Create App</DialogTitle>
          </VisuallyHidden>
          {
            makingUrlImageId && (
              <UrlMaker id={makingUrlImageId}></UrlMaker>
            )
          }
        </DialogContent>
      </Dialog>
      <UpgradeDialog open={showUpgrade} onOpenChange={(f) => setShowUpgrade(f)}></UpgradeDialog>
    </div>
  }

  return children
}