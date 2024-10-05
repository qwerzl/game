<script lang="ts" setup>
import { useTemplateRef, onMounted } from 'vue'
import { PencilLinesPass } from "~/composables/pencilLine/PencilLinesPass"

import { World } from '~/lib/world'
import { Player } from '~/lib/player'
import { Mountain } from '~/lib/mountain'
import { RpgCamera } from '~/lib/rpgCamera'

let world: World
let player: Player
let mountain: Mountain
let camera: RpgCamera

const dead = ref(false)
const score = ref(0)

onMounted(() => {
  function initiateGame() {
    world = new World(window);
    player = new Player(world);
    mountain = new Mountain(world, player);
    camera = new RpgCamera(world, player);
    world.setupEffectComposer(camera)
    world.addEffect(PencilLinesPass, camera)

    world.onLoaded(() => {
      world.onRender(t => {
        if (!player.timeOfDeath) {
          score.value = Math.round(world.clock!.elapsedTime * 10)
        } else {
          dead.value = true
        }
      });
    });

    world.render();
  }

  initiateGame();

  window.addEventListener('keydown', event => {
    if (event.code === 'Enter' && player.timeOfDeath) {
      dead.value = false
      world.teardown();
      setTimeout(() => initiateGame(), 2000);
    }
  });
});

</script>

<template>
  <ClientOnly>
  <div class="absolute top-5 left-5 text-black text-xl" :class="{ hidden: dead }" >
    <div ref="label-score">{{score}}</div>
  </div>
  <div class="absolute h-screen w-screen text-black">
    <div class="h-screen flex items-center justify-center text-xl font-bold" :class="{ hidden: !dead }">
      <div class="flex-col items-center space-y-2">
        <div ref="label-death" class="h-full text-center">You scored</div>
        <div ref="label-death-bg" class="h-full text-center text-6xl">{{score}}</div>
        <div ref="label-restart" class="h-full text-center flex">
          <p>
            Press
          </p>
          <kbd class="mx-2 text-xs">Enter</kbd>
          <p>
            to restart
          </p>
        </div>
      </div>
    </div>
  </div>
  </ClientOnly>
</template>

<style>
html, body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

div {
  user-select: none;
}

.label-death {
  display: none;
  z-index: 10;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10rem;
  color: white;

  &.active {
    display: block;
  }
}

.label-death-bg {
  content: " ";
  z-index: 9;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 20rem;
  transform: translate(-50%, -50%);
  transition: all 2s ease;
  background-color: black;
  opacity: 0.7;

  &.active {
    top: 50%;
    width: 100%;
    height: 100%;
  }
}

.label-score {
  z-index: 10;
  position: absolute;
  left: 5vw;
  bottom: 5vh;
  font-size: 10rem;
  transition: all 500ms ease;
  color: black;

  &.stopped {
    top: 50%;
    left: 50%;
    bottom: auto;
    font-size: 15rem;
    transform: translate(-50%, -50%);
    color: white;
  }
}

.label-speed {
  z-index: 5;
  position: absolute;
  left: 5vw;
  bottom: 20vh;
  font-size: 8rem;
  transition: all 500ms ease;
  color: black;

  &.stopped {
    top: 50%;
    left: 50%;
    bottom: auto;
    font-size: 8rem;
    transform: translate(-50%, -50%);
    color: white;
  }


}


.label-restart {
  display: none;
  z-index: 100;
  position: absolute;
  padding: 1rem 2rem;
  top: 75%;
  left: 50%;
  width: 100%;
  text-align: center;
  font-size: 5rem;
  color: white;
  transform: translate(-50%, -50%);

  &.active {
    display: block;
  }
}
.page-footer {
  position: fixed;
  right: 35px;
  bottom: 20px;
  display: flex;
  align-items: center;
  padding: 5px;
  color: black;
  background: rgba(255, 255, 255, 0.65);
}

.page-footer a {
  display: flex;
  margin-left: 4px;
}
.profile_picture{
  bottom: 0px;
  width:30px;
  height:30px;
}

kbd {
  background-color: #eee;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  box-shadow:
      0 1px 1px rgba(0, 0, 0, 0.2),
      0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
  color: #333;
  display: inline-block;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}
</style>
