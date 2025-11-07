<template>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; margin-bottom: 2rem;">Image SaaS 示例</h1>

    <div style="margin-bottom: 2rem;">
      <h2>上传按钮</h2>
      <VueUploadButton :onFileUploaded="onFileUploaded" :uploader="uploader" style="margin-right: 1rem;">
        选择图片
      </VueUploadButton>
    </div>

    <div style="margin-bottom: 2rem;">
      <h2>拖拽区域</h2>
      <VueDropzone :onFileUploaded="onFileUploaded" :onDraggingChange="onDraggingChange" :uploader="uploader"
        style="min-height: 200px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" stroke-width="1.5" style="margin-bottom: 1rem;">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m8 17 4 4 4-4"></path>
          </svg>
          <p style="font-size: 1.125rem; font-weight: 500; color: #1f2937; margin-bottom: 0.5rem;">
            拖拽文件到此处
          </p>
          <p style="color: #6b7280;">
            或者 <span style="color: #3b82f6; text-decoration: underline;">浏览文件</span>
          </p>
        </div>
      </VueDropzone>
    </div>

    <div>
      <h2>预览</h2>
      <div
        style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; min-height: 200px; display: flex; align-items: center; justify-content: center;">
        <img v-if="uploaded" :src="uploaded" alt="Uploaded image" style="max-width: 100%; max-height: 300px;" />
        <p v-else style="color: #6b7280;">暂无上传图片</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createApiClient } from '@image-sass/api';
import { connect } from '@image-saas/preact-vue-connect'
import { createUploader } from "@image-saas/uploader";
import { UploadButtonWithUploader } from '@image-saas/upload-button';
import { DropzoneWithUploader } from '@image-saas/dropzone'

const VueUploadButton = connect(UploadButtonWithUploader)
const VueDropzone = connect(DropzoneWithUploader)

// 定义响应式变量来存储上传图片的URL
const uploaded = ref('')

const uploader = createUploader(async (file) => {
  // 获取签名令牌
  const tokenResp = await fetch("/api/test");
  const token = await tokenResp.text();

  // 创建 API 客户端
  const apiClient = createApiClient({ signedToken: token });

  // 调用 createPresignedUrl mutation
  try {
    const result = await apiClient.file.createPresignedUrl.mutate({
      filename: file.data instanceof File ? file.data.name : "test",
      contentType: file.data.type || "",
      size: file.size,
    });

    return result;
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    throw error;
  }
});

function onFileUploaded(url) {
  uploaded.value = url;
}

function onDraggingChange(flag) {
  // 可以在这里处理拖拽状态变化
  console.log('Dragging state changed:', flag);
}
</script>