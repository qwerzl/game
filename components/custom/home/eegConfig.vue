<script setup lang="ts">
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { useEegConfigStore } from '~/stores/config'

const props = defineProps(['class'])

const config = useEegConfigStore()

const eegSupported = ref(false)

onMounted(() => {
  if ('serial' in navigator) {
    eegSupported.value = true
  }
})
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
        <Button class="rounded p-1 w-6 h-6 flex items-center" :variant="config.port ? 'constructive' : 'destructive'">
          <Icon name="mdi:connection" />
        </Button>
        <div class="pl-2">
          {{ config.port ? 'Connected' : 'Not Connected' }}
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
            Select EEG Device
          </div>
          <div class="text-sm text-muted-foreground">
            Select your EEG device here
          </div>
        </div>
        <div>
          <Button variant="outline" :disabled="!eegSupported || config.port" @click="config.connectEeg()">
            {{ config.port ? 'Connected' : eegSupported ? 'Connect' : 'Not Supported' }}
          </Button>
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
