import { Uppy } from "@uppy/core"
import { useEffect, useRef, useState } from "react";
import { trpcClientReact, trpcPureClient, AppRouter } from "@/utils/api"
import { cn } from "@/lib/utils";
import { useUppyState } from "@/app/dashboard/hooks/useUppyState";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { type FilesOrderByColumn } from "@/server/routes/file";
import { DeleteFile } from "./FileItemAction";
import { CopyUrl } from "./FileItemAction";

type FileResult = inferRouterOutputs<AppRouter>['file']['listFiles']
export function FileList({ uppy, orderBy, appId }: { uppy: Uppy, orderBy: FilesOrderByColumn, appId: string }) {


  const { data: infiniteQueryData, isPending, fetchNextPage } = trpcClientReact.file.infiniteQueryFiles.useInfiniteQuery({
    limit: 5,
    orderBy,
    appId
  }, {
    getNextPageParam: (resp) => resp.nextCursor,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
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
          type: file.data.type,
          appId,
        }).then((resp) => {
          utils.file.infiniteQueryFiles.setInfiniteData({ limit: 5, orderBy, appId }, (prev) => {
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
      if (data && data.fileIDs) {
        // 确保 data.fileIDs 是数组后再展开
        const fileIDs = Array.isArray(data.fileIDs) ? data.fileIDs : Object.keys(data.fileIDs);
        setUploadingFileIDs((currentFiles) => [...currentFiles, ...fileIDs])
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
  }, []) // 添加依赖数组

  const handleFileDelete = (id: string) => {
    utils.file.infiniteQueryFiles.setInfiniteData(
      { limit: 5, orderBy, appId }, (prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          pages: prev.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                items: page.items.filter(item => item.id !== id)
              }
            }
            return page
          })
        }
      }
    )
  }

  // 将 return 语句移到函数内部
  return (
    <ScrollArea>
      {isPending && <div className="text-center">Loading</div>}
      <div className={cn("flex flex-wrap justify-center gap-4 relative container ")}>

        {
          uploadingFileIDs.length > 0 && uploadingFileIDs.map((id) => {
            const file = uppyFiles[id]

            return (
              <div key={file.id} className="w-56 h-56 flex justify-center items-center border-red-500">
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })
        }
        {filesList?.map((file) => {

          return (
            <div key={file.id} className="w-56 h-56 flex justify-center items-center border">
              <div className="inset-0 absolute bg-background/30 opacity-0 transition-all hover:opacity-100 justify-center items-center flex">
                <CopyUrl url={file.url}></CopyUrl>
                <DeleteFile fileId={file.id} onDeleteSuccess={handleFileDelete}></DeleteFile>
              </div>
              <RemoteFileItem contentType={file.contentType} id={file.id} name={file.name}></RemoteFileItem>
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