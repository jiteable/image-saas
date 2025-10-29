<template>
  <div>
    <VueUploadButton :onFileUploaded="onFiles" :uploader="uploader">
      assdd
    </VueUploadButton>
    <img :src="uploaded" alt="">
  </div>
</template>

<script setup>
import { createApiClient } from "@image-sass/api"
import { UploadButton } from "@image-saas/upload-button"
import { connect } from "@image-saas/preact-vue-connect"
import { render, h } from 'preact'
import { createUploader } from "@image-saas/uploader"
import { UploadButtonWithUploader } from "@image-saas/upload-button"


const VueUploadButton = connect(UploadButtonWithUploader)

const containerRef = ref()

watchEffect(() => {
  if (containerRef.value) {
    render(h(UploadButton, { onClick: () => console.log('123') }), containerRef.value)
  }
})


const uploader = createUploader(async (file) => {

  const tokenResp = await fetch('/api/test')
  const token = await tokenResp.text()
  const apiClient = createApiClient({ signedToken: token })
  return apiClient.file.createPresignedUrl.mutate({
    filename: file.data instanceof File ? file.data.name : "test",
    contentType: file.data.type || "",
    size: file.size,
    appId: appId
  })
})

const uploaded = ref('')

function onFileUploaded(url) {
  uploaded.value = url
}
</script>
