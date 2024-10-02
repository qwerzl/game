<script lang="ts" setup>
import { useTemplateRef, onMounted } from 'vue'
import { PencilLinesPass } from "~/composables/pencilLine/PencilLinesPass";
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

import { World } from '~/lib/world';
import { Player } from '~/lib/player';
import { Mountain } from '~/lib/mountain';
import { RpgCamera } from '~/lib/rpgCamera';

let world: World;
let player: Player;
let mountain: Mountain;
let camera: RpgCamera;


onMounted(() => {
  console.log('onMounted')
    console.log('DOMContentLoaded');
    const scoreboard = useTemplateRef<HTMLInputElement>('label-score');
    const speedboard = useTemplateRef<HTMLInputElement>('label-speed');
    const labelRekt = useTemplateRef<HTMLInputElement>('label-death');
    const labelRektBg = useTemplateRef<HTMLInputElement>('label-death-bg');
    const labelRestart = useTemplateRef<HTMLInputElement>('label-restart');

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
            scoreboard.value!.textContent = String(Math.round(world.clock!.elapsedTime * 10))
          } else {
            labelRestart.value!.classList.add('active');
            scoreboard.value!.classList.add('stopped');
            speedboard.value!.classList.add('stopped');
            labelRekt.value!.classList.add('active');
            labelRektBg.value!.classList.add('active');
          }
          console.log('onRender')
        });
      });

      world.render();
    }

    initiateGame();

    window.addEventListener('keydown', event => {
      if (event.code === 'Enter' && player.timeOfDeath) {
        world.teardown();
        labelRestart.value!.classList.remove('active');
        scoreboard.value!.classList.remove('stopped');
        speedboard.value!.classList.remove('stopped');
        labelRekt.value!.classList.remove('active');
        labelRektBg.value!.classList.remove('active');
        setTimeout(() => initiateGame(), 2000);
      }
    });
});

</script>

<template>
  <ClientOnly>
    <div ref="label-death">分数</div>
    <div ref="label-death-bg"></div>
    <div ref="label-score"></div>
    <div ref="label-speed"></div>
    <div ref="label-restart">按回车键重新开始</div>
  </ClientOnly>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Ranchers');
html, body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: 'Ranchers', sans-serif;
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

</style>
