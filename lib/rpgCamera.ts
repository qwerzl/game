import { PerspectiveCamera, Vector3 } from 'three'
import type { Player } from '~/lib/player'
import type { World } from '~/lib/world'

export class RpgCamera extends PerspectiveCamera {
  player: Player
  world: World
  radius: number
  alpha: number
  beta: number
  offsetY: number

  constructor(world: World, player: Player) {
    super(90, world.window.innerWidth / world.window.innerHeight, 0.1, 1500)
    this.player = player
    this.world = world
    // Mouse
    this.radius = 15
    this.alpha = 0
    this.beta = Math.PI * 3 / 2.1
    this.offsetY = 12

    this.attachControl()
    world.onLoaded(() => {
      // Setting the camera AFTER meshes have loaded prevents glitchiness
      world.setCamera(this)
      world.onRender(t => this.update(t))
    })
  }

  update(t: number) {
    if (this.player.timeOfDeath && !this.player.dead) {
      this.alpha += (Math.PI - this.alpha) * 5 * t
    }
    if (this.player.dead) {
      this.alpha += Math.PI * t * 0.1
    }

    const camPos = this.position
    const pPos = this.player.position
    // sinA=x/r, cosA=z/r
    camPos.x = pPos.x - Math.cos(this.alpha + Math.PI / 2) * this.radius
    camPos.z = pPos.z - Math.sin(this.alpha + Math.PI / 2) * this.radius
    // cosB=y/r
    camPos.y = pPos.y + this.offsetY - Math.cos(this.beta) * this.radius

    this.lookAt(new Vector3(0, this.offsetY, 0).add(this.player.position))
  }

  attachControl(container = this.world.renderer!.domElement) {
    const wnd = this.world.window
    const doc = wnd.document
    const canvas = this.world.renderer!.domElement
    wnd.addEventListener('resize', () => {
      this.aspect = wnd.innerWidth / wnd.innerHeight
      this.updateProjectionMatrix()
    })
    doc.addEventListener('mousemove', (event) => {
      const { buttons, movementX, movementY } = event
      if (buttons & 1 << 0) {
        // primary button (left)
        // this.alpha += movementX*0.01
        this.beta = Math.min(Math.PI, Math.max(75 * Math.PI / 180, this.beta + movementY * 0.01)) // clamp [45,180]deg
      }
    })
    doc.addEventListener('mousedown', (event) => {
      if (!doc.pointerLockElement)
        canvas.requestPointerLock()
    }, false)
    doc.addEventListener('mouseup', (event) => {
      if (doc.pointerLockElement)
        doc.exitPointerLock()
    })
    doc.addEventListener('mousewheel', (event: WheelEvent) => {
      const { deltaY } = event
      this.radius = Math.min(Math.max(10, this.radius + deltaY * 0.02), 50)
    })
    doc.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })
  }
}
