/* eslint-disable @typescript-eslint/no-explicit-any */
import { type HTMLAttributes } from "preact/compat";
import { useRef } from "preact/hooks";

type CommonPreactComponentProps = {
  setChildrenContainer: (ele: HTMLElement | null) => void
}
export function UploadButton({
  onClick,
  setChildrenContainer,
  children,
  onFileChosed,
  ...props
}: HTMLAttributes<HTMLButtonElement> & CommonPreactComponentProps & { onFileChosed: (files: File | File[]) => void }) {

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = (e: MouseEvent) => {
    if (inputRef.current) {
      inputRef.current.click()
    }
    if (onClick) {
      onClick(e as any)
    }
  }

  return (
    <>
      <button {...props} onClick={handleClick} ref={(e) => setChildrenContainer(e)}>
        {children}
      </button>
      <input
        tabIndex={-1}
        type="file"
        ref={inputRef}
        onChange={(e) => {
          const filesFromEvent = (e.target as HTMLInputElement).files

          if (filesFromEvent) {
            onFileChosed(Array.from(filesFromEvent))
          }
        }}
        style={{ opacity: 0, position: "fixed", left: -10000 }}
      />
    </>
  )
}