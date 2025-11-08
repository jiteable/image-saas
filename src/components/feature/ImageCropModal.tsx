/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import Uppy from '@uppy/core';

interface ImageCropperModalProps {
  image: string;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
  uppy: Uppy
}

const ImageCropperModal = ({ image, onClose, onUploadSuccess, uppy }: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1 / 1);
  const [uploading, setUploading] = useState(false);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('rect'); // 添加裁剪形状状态
  const [showUpgrade, setShowUpgrade] = useState(false); // 添加状态来控制升级提示显示
  const croppedAreaPixelsRef = useRef<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    // 保存裁剪区域信息到ref中
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  // 提取裁剪图像并自动上传的函数
  const getCroppedImageAndUpload = useCallback(async () => {
    if (!croppedAreaPixelsRef.current || !image || !uppy) return;

    setUploading(true);
    try {
      const croppedAreaPixels = croppedAreaPixelsRef.current;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;

      // 使用Promise来确保图片加载完成
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const { width, height } = croppedAreaPixels;
            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
              reject(new Error('无法获取 Canvas 2D 上下文'));
              return;
            }

            // 绘制裁剪区域
            ctx.drawImage(
              img,
              croppedAreaPixels.x,
              croppedAreaPixels.y,
              croppedAreaPixels.width,
              croppedAreaPixels.height,
              0,
              0,
              width,
              height
            );

            resolve();
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('图片加载失败'));
        };
      });

      // 自动上传裁剪后的图片
      // 将canvas转换为blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('无法从canvas创建blob');
        }

        try {
          // 使用 Uppy 上传文件
          const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
          uppy.addFile({
            name: 'cropped-image.png',
            type: 'image/png',
            data: file,
          });

          // 开始上传
          await uppy.upload();
        } catch (error) {
          console.error('上传错误:', error);
          alert(`上传失败: ${(error as Error).message}`);
          setUploading(false);
        }
      }, 'image/png');
    } catch (error) {
      console.error('裁剪错误:', error);
      alert(`裁剪失败: ${(error as Error).message}`);
      setUploading(false);
    }
  }, [image, uppy, onUploadSuccess]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="p-4 border-b border-gray-200 bg-white">
          <DialogTitle className="text-lg font-semibold">图片裁剪</DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-white">
          {/* 添加裁剪形状选择控件 */}
          <div className="mb-2.5 flex items-center">
            <label className="mr-2.5">裁剪形状:</label>
            <select
              value={cropShape}
              onChange={(e) => setCropShape(e.target.value as 'rect' | 'round')}
              aria-label="选择裁剪形状"
              className="crop-shape-select rounded border border-gray-300 bg-white px-1 py-1.5 mr-2.5"
            >
              <option value="rect">方形</option>
              <option value="round">圆形</option>
            </select>
          </div>

          <div className="relative w-full h-[300px]">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape={cropShape} // 使用状态中的裁剪形状
              showGrid={false}
            />
          </div>
        </div>

        {/* 显示升级提示 */}
        {showUpgrade && (
          <div className="px-4 py-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p>您已达到免费计划的限制。请升级以继续上传更多图片。</p>
          </div>
        )}

        <DialogFooter className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={getCroppedImageAndUpload}
            disabled={!image || uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {uploading ? '处理中...' : '确定裁剪'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            取消
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;