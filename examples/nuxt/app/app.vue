<template>
  <div>
    <VueUploadButton :onFileUploaded="onFileUploaded" :uploader="uploader">
      asdasd
    </VueUploadButton>
    <VueDropzone :onFileUploaded="onFileUploaded" :onDraggingChange="onDraggingChange" :uploader="uploader">
      <div style="width: 200px; height: 200px; background-color: red;">

      </div>
    </VueDropzone>
    <img v-if="uploaded" :src="uploaded" alt="Uploaded image" />
    <p v-else>No image uploaded yet</p>
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