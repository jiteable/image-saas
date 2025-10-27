<template>
  <div>Hello World</div>
</template>

<script setup>
import { createApiClient } from "@image-sass/api"
import { onMounted } from "vue";

const apiClient = createApiClient({ apiKey: "asd" })

onMounted(() => {
  apiClient.file.createPresignedUrl.mutate({
    filename: "屏幕截图 2024-08-19 173036.png",
    contentType: "image/png",
    size: 10378,
    appId: "796bda6b-ff3c-4cfc-bfb4-330a0e62693d"
  })
})


</script>