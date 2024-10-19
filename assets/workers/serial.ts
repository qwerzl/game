const attentionLevelStats = new Map<number, number>()
const averagedAttentionLevelStats = new Map<number, number>()

async function serialDataCollection() {
  const startTimestamp = performance.now()

  const bytesQueue: number[] = []
  const ports = await navigator.serial.getPorts()
  const port = ports[0]
  await port.open({ baudRate: 57600 })

  let sum = 0

  const reader = port.readable?.getReader()

  // Listen to data coming from the serial device.
  while (true) {
    if (reader) {
      const { value, done } = await reader.read()
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock()
        break
      }

      // Begin parsing the data.
      for (const byte of value) {
        if (bytesQueue.length === 0 && byte === 0xAA) {
          // First 0xAA: Sync
          bytesQueue.push(byte)
        }
        else if (bytesQueue.length === 1 && byte === 0xAA) {
          // Second 0xAA: Sync
          if (byte === 0xAA) {
            bytesQueue.push(byte)
          }
          else {
            bytesQueue.length = 0
            sum = 0
          }
        }
        else if (bytesQueue.length === 2) {
          // 0x20: Packet Length, indicating it's a big packet of 32 bytes. We don't need small packets here.
          if (byte === 0x20) {
            bytesQueue.push(byte)
          }
          else {
            bytesQueue.length = 0
            sum = 0
          }
        }
        // So far, we have 3 bytes in the queue: 0xAA, 0xAA, 0x20. Next 32 bytes should be the data packet.
        else if (bytesQueue.length >= 3 && bytesQueue.length <= 34) {
          sum += byte
          bytesQueue.push(byte)
        }
        else if (bytesQueue.length === 35) {
          if ((~sum & 0xFF) === byte) {
            if (bytesQueue[32] !== 0) {
              self.postMessage(bytesQueue[32])
              attentionLevelStats.set(
                performance.now() - startTimestamp,
                bytesQueue[32],
              )
              if (attentionLevelStats.size < 5) {
                averagedAttentionLevelStats.set(
                  performance.now() - startTimestamp,
                  (Array.from(attentionLevelStats.values()).reduce((a, b) => a + b) / attentionLevelStats.size),
                )
              }
              else {
                averagedAttentionLevelStats.set(
                  performance.now() - startTimestamp,
                  (Array.from(attentionLevelStats.values())[
                    attentionLevelStats.size - 1
                  ]
                  + Array.from(attentionLevelStats.values())[
                    attentionLevelStats.size - 2
                  ]
                  + Array.from(attentionLevelStats.values())[
                    attentionLevelStats.size - 3
                  ]
                  + Array.from(attentionLevelStats.values())[
                    attentionLevelStats.size - 4
                  ])
                  / 4,
                )
              }
            }
          }
          bytesQueue.length = 0
          sum = 0
        }
      }
    }
  }
}

self.addEventListener('message', async (event) => {
  if (event.data === 'start') {
    await serialDataCollection()
  }
  if (event.data === 'stop') {
    self.postMessage([attentionLevelStats, averagedAttentionLevelStats])
  }
})

/**
 * Reference (Chinese):
 * 0   AA 同步  <--- Verification
 * 1   AA 同步  <--- Verification
 * 2   20 是十进制的32，即有32个字节的payload，除掉20本身+两个AA同步+最后校验和 <-- Big Packet Indicator
 * 3   02 代表信号值Signal
 * 4   C8 信号的值
 * 5   83 代表EEG Power开始了
 * 6   18 是十进制的24，说明EEG Power是由24个字节组成的，以下每三个字节为一组
 * 7   18 Delta 1/3
 * 8   D4 Delta 2/3
 * 9   8B Delta 3/3
 * 10  13 Theta 1/3
 * 11  D1 Theta 2/3
 * 12  69 Theta 3/3
 * 13  02 LowAlpha 1/3
 * 14  58 LowAlpha 2/3
 * 15  C1 LowAlpha 3/3
 * 16  17 HighAlpha 1/3
 * 17  3B HighAlpha 2/3
 * 18  DC HighAlpha 3/3
 * 19  02 LowBeta 1/3
 * 20  50 LowBeta 2/3
 * 21  00 LowBeta 3/3
 * 22  03 HighBeta 1/3
 * 23  CB HighBeta 2/3
 * 24  9D HighBeta 3/3
 * 25  03 LowGamma 1/3
 * 26  6D LowGamma 2/3
 * 27  3B LowGamma 3/3
 * 28  03 MiddleGamma 1/3
 * 29  7E MiddleGamma 2/3
 * 30  89 MiddleGamma 3/3
 * 31  04 代表专注度Attention
 * 32  00 Attention的值(0到100之间) <--- We need this
 * 33  05 代表放松度Meditation
 * 34  00 Meditation的值(0到100之间)
 * 35  D5 校验和
 */
