<script setup lang="ts">
const props = defineProps(["class", "variant"]);
</script>

<template>
  <Drawer class="w-full">
    <DrawerTrigger as-child>
      <Button :class="props.class" :variant="props.variant"> Settings </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Settings</DrawerTitle>
        <DrawerDescription>Configure this game here</DrawerDescription>
      </DrawerHeader>

      <div
        class="flex flex-row items-center justify-between rounded-lg border p-4 mx-4"
      >
        <div class="space-y-0.5">
          <div class="text-base font-medium">Test</div>
          <div class="text-sm text-muted-foreground">Test</div>
        </div>
        <div>
          <Switch />
        </div>
      </div>

      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline"> Cancel </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<style scoped></style>
