import { Uppy } from "@uppy/core"
import { useEffect, useRef, useState } from "react";
import { trpcClientReact, trpcPureClient, AppRouter } from "@/utils/api"
import { cn } from "@/lib/utils";
import { useUppyState } from "@/app/dashboard/hooks/useUppyState";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type FileResult = inferRouterOutputs<AppRouter>['file']['listFiles']
export function FileList({ uppy }: { uppy: Uppy }) {

  const { data: infiniteQueryData, isPending, fetchNextPage } = trpcClientReact.file.infiniteQueryFiles.useInfiniteQuery({
    limit: 5
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
          utils.file.infiniteQueryFiles.setInfiniteData({ limit: 5 }, (prev) => {
            if (!prev) {
              return prev
            }
            return {
              ...prev,
              pages: prev.pages.map((page, index) => {
                if (index === 0) {
                  return {
                    ...page,
                    items: [resp, ...page.items]
                  }
                }
                return page
              })
            }
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

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (bottomRef.current) {
      const observer = new IntersectionObserver((e) => {
        if (e[0].intersectionRatio > 0.1) {
          fetchNextPage()
        }
      }, {
        threshold: 0.1
      })

      observer.observe(bottomRef.current)

      const element = bottomRef.current

      return () => {
        observer.unobserve(element)
        observer.disconnect()
      }
    }
  })

  return (
    <ScrollArea>
      {isPending && <div>Loading</div>}
      <div className={cn("flex flex-wrap justify-center gap-4 relative container ")}>

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
      </div>
      <div className={cn("flex justify-center p-8 hidden", filesList.length > 0 && "flex")} ref={bottomRef}>
        <Button variant="ghost" onClick={() => fetchNextPage()}>Load Next Page</Button>
      </div>
    </ScrollArea>

  )
}