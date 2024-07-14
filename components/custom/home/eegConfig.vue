<script setup lang="ts">

import {cn} from "~/lib/utils";
import {buttonVariants} from "~/components/ui/button";
import {useEegConfigStore} from "~/stores/config";

const props = defineProps(['class'])

const config = useEegConfigStore()
</script>

<template>
  <Drawer>
    <DrawerTrigger>
      <a
          :class="cn(
            buttonVariants({ variant: 'ghost' }),
            props.class,
          )"
      >
        <Button class="rounded p-1 w-6 h-6 flex items-center" :variant="config.enabled ? 'constructive' : 'destructive'">
          <Icon name="mdi:connection" />
        </Button>
        <div class="pl-2">
          {{ config.enabled ? 'Connected' : 'Not Connected' }}
        </div>
      </a>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>EEG Connection Settings</DrawerTitle>
        <DrawerDescription>Connect to your EEG Device here</DrawerDescription>
      </DrawerHeader>

      <div class="flex flex-row items-center justify-between rounded-lg border p-4 mx-4">
        <div class="space-y-0.5">
          <div class="text-base font-medium">
            Toggle EEG Status
          </div>
          <div class="text-sm text-muted-foreground">
            Test
          </div>
        </div>
        <div>
          <Switch :checked="config.enabled" @update:checked="config.$patch({ enabled: !(config.enabled) })" />
        </div>
      </div>

      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<style scoped>

</style>
