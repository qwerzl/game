<script setup lang="ts">
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { PencilLinesPass } from "~/effects/PencilLinesPass";

import type { Sizes } from "~/effects/types";

const { renderer, scene, camera } = useTresContext()

const composer = new EffectComposer(renderer.value)

if (!camera.value) {
  throw new Error('Camera not found')
}

const renderPass = new RenderPass(scene.value, camera.value!)

composer.addPass(renderPass)

composer.addPass(new PencilLinesPass(
  {
    width: renderer.value.domElement.width,
    height: renderer.value.domElement.height,
  } as Sizes,
  camera.value,
  scene.value
))

function tick() {
  requestAnimationFrame(tick)
  composer.render()
}

tick()
</script>

<template>

</template>

<style scoped>

</style>
