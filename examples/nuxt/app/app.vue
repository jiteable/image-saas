<template>
  <div>
    <VueUploadButton :onFileChosed="onFiles" :uploader="uploader">
      Upload Files
    </VueUploadButton>
    <img v-if="uploaded" :src="uploaded" alt="Uploaded image" />
    <p v-else>No image uploaded yet</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createApiClient } from '@image-sass/api';
import { connect } from '@image-saas/preact-vue-connect'
import { UploadButton } from '@image-saas/upload-button';
import { createUploader } from "@image-saas/uploader";

const VueUploadButton = connect(UploadButton)

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
      appId: "9b122530-f22a-4a42-8a11-63f845e39f20" // 你需要替换为有效的 appId
    });

    return result;
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    throw error;
  }
});

// 设置上传成功事件监听器
onMounted(() => {
  uploader.on('upload-success', (file, resp) => {
    console.log('Upload successful, URL: ', resp.uploadURL);
    // 更新 uploaded 变量以显示图片
    uploaded.value = resp.uploadURL;
  });

  uploader.on('upload-error', (file, error) => {
    console.error('Upload error:', error);
  });
});

function onFiles(files) {
  uploader.addFiles(
    files.map((file) => ({
      data: file,
      name: file.name,
      type: file.type,
      size: file.size,
    }))
  )

  // 开始上传
  uploader.upload()
}

</script>