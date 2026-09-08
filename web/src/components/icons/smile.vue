<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    class="w-5 h-5"
  >
    <g
      fill="none"
      stroke="#888888"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      <!-- 圆脸 -->
      <path d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9" />
      <!-- 左眼 -->
      <path d="M9 9v1" />
      <!-- 右眼 -->
      <path d="M15 9v1" />
      <!-- 嘴巴 -->
      <path d="M8 14c0.5 1.5 1.79 3 4 3c2.21 0 3.5 -1.5 4 -3" />
    </g>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'smile',
}
</script>