import Uppy from "@uppy/core"
import { ReactNode, useState, useRef, HTMLAttributes } from "react"

export function Dropzone({ uppy, children, ...divProps }: { uppy: Uppy; children: ReactNode | ((draging: boolean) => ReactNode) } & Omit<HTMLAttributes<HTMLDivElement>, 'children'>) {
  const [dragging, setDragging] = useState(false)
  const timeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (
    <div
      {...divProps}
      onDragEnter={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (timeRef.current) {
          clearTimeout(timeRef.current)
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        if (timeRef.current) {
          clearTimeout(timeRef.current)
          timeRef.current = null
        }
        timeRef.current = setTimeout(() => {
          setDragging(false)
        }, 50)
      }}
      onDrop={(e) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        Array.from(files).forEach(file => {
          uppy.addFile({
            name: file.name,
            data: file,
            type: file.type,
            meta: {
              name: file.name
            }
          })
        })
        setDragging(false)
      }}
    >
      {typeof children === "function" ? children(dragging) : children}
    </div>
  )
}