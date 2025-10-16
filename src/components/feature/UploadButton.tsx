import Uppy from "@uppy/core";


export function UploadButton({ uppy }: { uppy: Uppy }) {
  return (
    <>
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
    </>
  )
}