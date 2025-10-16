/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Uppy } from "@uppy/core"
import AWSS3 from "@uppy/aws-s3"
import { useEffect, useState } from "react";
import { useUppyState } from "@uppy/react";
import { trpcPureClient } from "@/utils/api"
import { Button } from "@/components/ui/button";
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

  const files = useUppyState(uppy, (s) => Object.values(s.files))
  const progress = useUppyState(uppy, (s) => s.totalProgress)

  useEffect(() => {
    const handler = (file: any, resp: any) => {
      if (file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type
        })
      }
    }
    uppy.on("upload-success", handler)

    return () => {
      uppy.off("upload-success", handler)
    }
  }, [uppy])

  return (
    <div className="h-screen flex justify-center items-center">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
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
      <div>{progress}</div>
    </div>
  );
}