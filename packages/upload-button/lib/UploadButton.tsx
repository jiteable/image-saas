/* eslint-disable @typescript-eslint/no-explicit-any */
import { type HTMLAttributes } from "preact/compat";
import { useRef } from "preact/hooks";

type CommonPreactComponentProps = {
  setChildrenContainer: (ele: HTMLElement | null) => void
}
export function UploadButton(props: HTMLAttributes<HTMLButtonElement> & CommonPreactComponentProps & { onFileChosed: (files: File | File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { onClick, children, onFileChosed, setChildrenContainer, ...otherProps } = props;

  const handleClick = (e: MouseEvent) => {
    // 处理文件输入点击
    if (inputRef.current) {
      inputRef.current.click();
    }

    // 如果有传入的 onClick 回调，则调用它
    if (onClick) {
      onClick(e as any); // 类型断言解决事件类型不匹配问题
    }
  };

  return (
    <>
      <button {...otherProps as any} onClick={handleClick} ref={(e) => setChildrenContainer(e)}>
        {children || "Click Me"}
      </button >
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
  );
}