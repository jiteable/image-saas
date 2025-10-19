/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Uppy } from "@uppy/core"
import AWSS3 from "@uppy/aws-s3"
import { useState } from "react";
import { trpcClientReact, trpcPureClient } from "@/utils/api"
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/components/feature/UploadButton";
import { Dropzone } from "@/components/feature/Dropzone";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";
import { FileList } from "@/components/feature/FileList";
import { FilesOrderByColumn } from "@/server/routes/file";
import { MoveDown, MoveUp } from "lucide-react";

export default async function AppPage({ params: { id: appId } }: { params: { id: string } }) { // 添加 async 关键字

  const [uppy] = useState<Uppy>(() => {
    const uppyInstance = new Uppy();
    uppyInstance.use(AWSS3, {
      shouldUseMultipart: false,
      getUploadParameters(file) {
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename:
            file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size ?? 0
        })
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

  return (
    <div className="mx-auto h-full">
      <div className="flex container justify-between items-center h-[60px]">
        <Button onClick={() => {
          setOrderBy(current => ({
            ...current,
            order: current?.order === 'asc' ? 'desc' : 'asc'
          }))
        }}>Created At {orderBy.order === "desc" ? <MoveUp /> : <MoveDown />}</Button>
        <UploadButton uppy={uppy}></UploadButton>
      </div>
      <Dropzone uppy={uppy} className="relative h-[clac(100% - 60px)]">
        {
          (draging) => {
            return <> draging && (
              <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center">
                Drop File Here to Upload
              </div>)

              <FileList appId={appId} uppy={uppy} orderBy={orderBy}></FileList>
            </>
          }
        }
      </Dropzone>

      <UploadPreview uppy={uppy}></UploadPreview>
    </div >
  );
}