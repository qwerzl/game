<script setup lang="ts">
import { Button } from '@/components/ui/button'

import eegConfig from '~/components/custom/home/eegConfig.vue'
import Settings from "~/components/custom/home/settings.vue";
</script>

<template>

  <div class="container relative h-screen flex items-center justify-center max-w-none px-0">
    <eeg-config class='absolute md:right-4 md:top-4 right-2 top-2' />

    <div>
      <div class="flex items-center justify-center mb-6">
        <div class="w-40 h-40">
          <AspectRatio :ratio="1" class="bg-muted">
            <NuxtImg
                src="/ski.png"
                alt="MindSki"
                class="rounded-md object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
      </div>
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">
            MindSki
          </h1>
          <p class="text-sm text-muted-foreground">
            Click a button to continue
          </p>
        </div>
        <div class="grid gap-6">
          <div>
            <div class="grid gap-2">
              <div class="grid gap-2">
                <Button as-child>
                  <NuxtLink to="/game">
                    Play with EEG
                  </NuxtLink>
                </Button>
                <Button as-child>
                  <NuxtLink to="/game">
                    Play without EEG
                  </NuxtLink>
                </Button>
                <Settings variant="outline" class="w-max w-full" />
              </div>
            </div>
          </div>
        </div>
        <p class="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our
          <a
              href="/terms"
              class="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>
          and
          <a
              href="/privacy"
              class="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  </div>
</template>
