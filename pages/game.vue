<script lang="ts" setup>
import { LineChart } from '@/components/ui/chart-line'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { onMounted } from 'vue'
import { PencilLinesPass } from '~/composables/pencilLine/PencilLinesPass'

import { Mountain } from '~/lib/mountain'

import { Player } from '~/lib/player'
import { RpgCamera } from '~/lib/rpgCamera'
import { World } from '~/lib/world'
import { useEegConfigStore } from '~/stores/config'

const config = useEegConfigStore()

let world: World
let player: Player
// eslint-disable-next-line unused-imports/no-unused-vars
let mountain: Mountain
let camera: RpgCamera

const dead = ref(false)
const score = ref(0)

onMounted(async () => {
  function initiateGame() {
    if (config.enabled) {
      config.startCollection()
    }

    world = new World(window)
    player = new Player(world)
    mountain = new Mountain(world, player)
    camera = new RpgCamera(world, player)
    world.setupEffectComposer(camera)
    world.addEffect(PencilLinesPass, camera)

    world.onLoaded(() => {
      world.onRender(() => {
        if (!player.timeOfDeath) {
          score.value = Math.round(world.clock!.elapsedTime * 10)
        }
        else {
          config.stopCollection()
          dead.value = true
        }
      })
    })

    world.render()
  }

  initiateGame()

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' && player.timeOfDeath) {
      dead.value = false
      world.teardown()
      setTimeout(() => initiateGame(), 200)
    }
  })
})
</script>

<template>
  <ClientOnly>
    <div
      class="absolute top-5 left-5 text-black text-xl"
      :class="{ hidden: dead }"
    >
      <div class="flex">
        <Icon v-for="i in [...Array(config.lives).keys()]" :key="i" name="material-symbols:circle" class="w-4 h-4 grayscale" />
      </div>
      <div>
        {{ score }}
      </div>
    </div>
    <div class="absolute h-screen w-screen text-black">
      <div
        class="h-screen flex items-center justify-center text-xl font-bold"
        :class="{ hidden: !dead }"
      >
        <div class="flex-col items-center space-y-2">
          <div class="h-full text-center">
            You scored
          </div>
          <div class="h-full text-center text-6xl">
            {{ score }}
          </div>
          <div class="h-full text-center flex items-center w-full">
            <Button class="w-full">
              Play Again
            </Button>
            <Dialog v-if="config.enabled">
              <DialogTrigger as-child>
                <Button class="pl-2">
                  View Statistics
                </Button>
              </DialogTrigger>
              <DialogContent class="md:max-w-[700px] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Attention Level Statistics</DialogTitle>
                  <DialogDescription>
                    View the changes of your attention level throughout the game here.
                  </DialogDescription>
                </DialogHeader>
                <LineChart
                  v-if="dead && config.averagedStats"
                  :data="Array.from(config.averagedStats, ([key, value]) => ({ 'time': Math.round(key / 1000), 'Attention Level': Math.round(value) }))"
                  index="time"
                  :categories="['Attention Level']"
                  :margin="{ top: 100, bottom: 0 }"
                  :x-formatter="(tick, i) => {
                    return typeof tick === 'number'
                      ? `${tick}s`
                      : ''
                  }"
                  :y-formatter="(tick, i) => {
                    return typeof tick === 'number'
                      ? `${tick}%`
                      : ''
                  }"
                />
                <DialogFooter />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style>
canvas {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

div {
  user-select: none;
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

.shaking {
  animation: shake 0.5s;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>
