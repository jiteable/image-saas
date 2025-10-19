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
import Link from "next/link";

export default async function Home() { // 添加 async 关键字

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

  const utils = trpcClientReact.useUtils()

  const { data: fileList, isPending } = trpcClientReact.file.listFiles.useQuery()

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
      {
        isPending && <div>Loading</div>
      }
      <Dropzone uppy={uppy} className="relative h-[clac(100% - 60px)]">
        {
          (draging) => {
            return <> draging && (
              <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center">
                Drop File Here to Upload
              </div>)

              <FileList uppy={uppy} orderBy={orderBy}></FileList>
            </>
          }
        }
      </Dropzone>

      <UploadPreview uppy={uppy}></UploadPreview>
      {/* <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        选择文件
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
              try {
                uppy.addFile({
                  name: file.name,           // 添加必需的 name 属性
                  type: file.type,           // 添加 type 属性
                  data: file,                // 文件数据
                });
              } catch (error) {
                console.error('添加文件失败:', error);
              }
            })
          }
        }}
        multiple
      ></input>
      {files.map((file) => {
        const url = URL.createObjectURL(file.data)
        return (
          <div key={file.id} className="relative">
            <img
              src={url}
              alt={file.name}
              className="max-w-[200px] max-h-[200px] object-contain"
            />
            <p className="text-xs mt-1 truncate">{file.name}</p>
          </div>
        );
      })}
      <Button
        onClick={() => {
          uppy.upload()
        }}
      > Upload</Button>
      <div>{progress}</div> */}
    </div >
  );
}