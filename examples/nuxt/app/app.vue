<template>
  <div ref="containerRef">Hello World</div>
</template>

<script setup>
import { createApiClient } from "@image-sass/api"
import { onMounted } from "vue";
import { UploadButton } from "@image-saas/upload-button"
import { render, h } from 'preact'


const containerRef = ref()

watchEffect(() => {
  if (containerRef.value) {
    render(h(UploadButton, { onClick: () => console.log('123') }), containerRef.value)
  }
})

onMounted(async () => {
  const tokenResp = await fetch('/api/test')
  const token = await tokenResp.text()

  const apiClient = createApiClient({ signedToken: token })

  apiClient.file.createPresignedUrl.mutate({
    filename: "屏幕截图 2024-08-19 173036.png",
    contentType: "image/png",
    size: 10378,
    appId: "796bda6b-ff3c-4cfc-bfb4-330a0e62693d"
  })
})


</script>
