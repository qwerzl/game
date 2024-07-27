<script lang="ts" setup>
</script>

<template>
  <TresCanvas clear-color="#FFFFFF" window-size>
    <TresPerspectiveCamera />
    <OrbitControls />
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
      <TresMeshBasicMaterial color="white" />
    </TresMesh>
    <PencilEffect />
  </TresCanvas>
</template>
