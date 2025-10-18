import { Uppy } from "@uppy/core"
import { useEffect, useState } from "react";
import { trpcClientReact, trpcPureClient, AppRouter } from "@/utils/api"
import { cn } from "@/lib/utils";
import { useUppyState } from "@/app/dashboard/hooks/useUppyState";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { Button } from "../ui/button";

type FileResult = inferRouterOutputs<AppRouter>['file']['listFiles']
export function FileList({ uppy }: { uppy: Uppy }) {

  const { data: infiniteQueryData, isPending, fetchNextPage } = trpcClientReact.file.infiniteQueryFiles.useInfiniteQuery({
    limit: 3
  }, {
    getNextPageParam: (resp) => resp.nextCursor
  })

  const filesList = infiniteQueryData ? infiniteQueryData.pages.reduce((result, page) => {
    return [...result, ...page.items]
  }, [] as FileResult) : []

  const utils = trpcClientReact.useUtils()

  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([])
  const uppyFiles = useUppyState(uppy, (s) => s.files)

  useEffect(() => {
    const handler = (file: any, resp: any) => {
      if (file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type
        }).then((resp) => {
          utils.file.listFiles.setData(void 0, (prev) => {
            if (!prev) {
              return prev
            }
            return [resp, ...prev]
          })
        })
      }
    }

    const uploadProgressHandler = (data: any) => {
      if (data) {
        setUploadingFileIDs((currentFiles) => [...currentFiles, ...data.fileIDs])
      }
    }

    const completeHandler = () => {
      setUploadingFileIDs([])
    }

    uppy.on('upload', uploadProgressHandler)

    uppy.on("upload-success", handler)

    uppy.on('complete', completeHandler)

    return () => {
      uppy.off("upload-success", handler)
      uppy.off('upload', uploadProgressHandler)
      uppy.off('complete', completeHandler)
    }
  }, [uppy, utils])

  return (
    <>
      {isPending && <div>Loading</div>}
      <div className={cn("flex flex-wrap gap-4 relative")}>

        {
          uploadingFileIDs.length > 0 && uploadingFileIDs.map((id) => {
            const file = uppyFiles[id]

            const isImage = file.data.type.startsWith("image");

            const url = URL.createObjectURL(file.data)

            return (
              <div key={file.id} className="w-56 h-56 flex justify-center items-center border-red-500">
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })
        }
        {filesList?.map((file) => {
          const isImage = file.contentType.startsWith("image");

          return (
            <div key={file.id} className="w-56 h-56 flex justify-center items-center border">
              <RemoteFileItem contentType={file.contentType} url={file.url} name={file.name}></RemoteFileItem>
            </div>
          );
        })}

        <Button onClick={() => fetchNextPage()}>Load Next Page</Button>
      </div>
    </>

  )
}