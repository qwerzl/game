/// <reference types="w3c-web-serial" />
import DataCollectionWorker from '@/assets/workers/serial?worker'

export const useEegConfigStore = defineStore('eegConfigStore', {
  state: () => ({
    port: undefined as SerialPort | undefined,
    worker: new DataCollectionWorker(),
    stats: undefined as Map<number, number> | undefined,
    connected: false,
    enabled: false,
    currentAttentionLevel: 0,
  }),
  actions: {
    async connectEeg() {
      try {
        if (import.meta.client) {
          this.port = await navigator.serial.requestPort()
          navigator.serial.addEventListener('connect', (e) => {
            this.connected = true
          })

          navigator.serial.addEventListener('disconnect', (e) => {
            this.connected = false
            this.port = undefined
          })
        }
      }
      catch (error) {
        return error
      }
    },
    startCollection() {
      this.worker.postMessage('start')
      this.worker.addEventListener('message', (e) => {
        if (typeof e.data === 'number') {
          this.currentAttentionLevel = e.data
        }
      }, false)
    },
    stopCollection() {
      this.worker.postMessage('stop')
      this.worker.addEventListener('message', (e) => {
        if (e.data instanceof Map) {
          this.stats = e.data
          this.worker.terminate()
        }
      }, false)
    },
  },
})
