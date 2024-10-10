import type { Pass } from 'three/examples/jsm/postprocessing/Pass'
import {
  AmbientLight,
  type AnimationMixer,
  CineonToneMapping,
  Clock,
  Color,
  DefaultLoadingManager,
  DirectionalLight,
  HemisphereLight,
  type LoadingManager,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  type PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export class World {
  window: Window
  clock: Clock | null
  isLoading: boolean
  loader: LoadingManager | null
  onLoadedCallbacks: Function[] | null
  renderer: WebGLRenderer | undefined | null
  onRenderCallbacks: Function[] | null
  loadedFbx: Record<string, any>
  animationMixers: AnimationMixer[] | null
  scene: Scene | undefined | null
  ambientLight: AmbientLight | undefined
  camera: PerspectiveCamera | undefined | null
  animationFrameId: number | undefined
  effectComposer: EffectComposer | undefined
  // effect: OutlineEffect | undefined

  constructor(wnd: Window) {
    this.window = wnd
    this.clock = new Clock()
    this.isLoading = true
    this.loader = DefaultLoadingManager
    this.onLoadedCallbacks = []
    this.loader.onLoad = () => {
      this.isLoading = false
      this.onLoadedCallbacks?.forEach(cb => cb())
    }
    this.loader.onError = url => console.error(`There was an error loading ${url}`)

    this.setupScene()
    this.setupRenderer()
    this.setupLighting()

    // Auto resize engine
    wnd.addEventListener('resize', () => {
      if (this.renderer) {
        this.renderer.setSize(wnd.innerWidth, wnd.innerHeight)
      }
    })

    this.onRenderCallbacks = []
    this.animationMixers = []
    this.loadedFbx = {}
  }

  setupRenderer() {
    const renderer = new WebGLRenderer({ alpha: true })
    renderer.setSize(this.window.innerWidth, this.window.innerHeight)
    renderer.setClearColor('#eee')
    renderer.toneMapping = CineonToneMapping
    renderer.toneMappingExposure = 1.75
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    this.renderer = renderer
    this.window.document.body.appendChild(renderer.domElement)
    // this.effect = new OutlineEffect( renderer );
  }

  setupEffectComposer(camera: PerspectiveCamera) {
    this.effectComposer = new EffectComposer(this.renderer!)
    this.effectComposer.addPass(new RenderPass(this.scene!, camera))
  }

  setupScene() {
    const scene = new Scene()
    scene.background = new Color(0xFDEDD7)
    this.scene = scene
  }

  setupLighting() {
    const ambientLight = new AmbientLight(0xFFFFFF, 0.5)
    this.scene?.add(ambientLight)
    this.ambientLight = ambientLight

    const hemisphereLight = new HemisphereLight(0x7A3114, 0x48C3FF, 0.5)
    this.scene?.add(hemisphereLight)

    const directionalLight = new DirectionalLight(0xFFFFFF, 1)
    directionalLight.castShadow = true
    directionalLight.position.set(2, 2, 2)
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene?.add(directionalLight)
  }

  addAnimationMixer(mixer: AnimationMixer) {
    this.animationMixers?.push(mixer)
  }

  loadFbx(name: string, filename: string, addToScene = false, cb = (error: Error | null, result: any) => {}) {
    const fbxLoader = new FBXLoader(this.loader)
    fbxLoader.load(filename, (object) => {
      if (object.type === 'Group') {
        for (const child of object.children) {
          if (child.isMesh) {
            child.material = new MeshStandardMaterial({ color: 0xFDEDD7 })
            child.castShadow = true
          }
        }
      }
      object.name = name
      if (this.loadedFbx[name]) {
        console.log(`Warning: overwriting existing FBX '${name}'!`)
      }
      this.loadedFbx[name] = object
      if (addToScene && this.scene)
        this.scene.add(object)
      cb(null, object)
    }, (xhr: any) => {
      // console.log(xhr.loaded/xhr.total*100 + '% loaded')
    }, (xhr: any) => {
      const errMsg = `Error loading FBX '${name}': ${JSON.stringify(xhr)}!`
      console.error(errMsg)
      cb(new Error(errMsg), null)
    })
  }

  onLoaded(cb: Function) {
    if (typeof cb !== 'function') {
      throw new TypeError(`${cb} must be a function!`)
    }

    if (this.isLoading) {
      this.onLoadedCallbacks?.push(cb)
    }
    else {
      // Already loaded, invoke callback immediately
      cb()
    }
  }

  onRender(cb) {
    if (typeof cb !== 'function') {
      throw new TypeError(`${cb} must be a function!`)
    }
    else {
      this.onRenderCallbacks?.push(cb)
    }
  }

  setCamera(camera: PerspectiveCamera) {
    this.camera = camera
  }

  teardown() {
    if (this.animationFrameId)
      cancelAnimationFrame(this.animationFrameId)
    while (this.scene?.children.length) {
      const child = this.scene.children[0]
      child.traverse((c) => {
        if (typeof c.dispose === 'function') {
          c.dispose()
        }
      })
      if (typeof child.dispose === 'function') {
        child.dispose()
      }
      this.scene.remove(child)
    }
    this.scene = null
    this.camera = null
    this.clock = null
    this.loader = null
    this.onLoadedCallbacks = null
    this.onRenderCallbacks = null
    this.animationMixers = null
    Object.keys(this.loadedFbx).forEach((key) => {
      this.loadedFbx[key].traverse((child: any) => {
        if (typeof child.dispose === 'function') {
          child.dispose()
        }
      })
      this.loadedFbx[key] = null
      delete this.loadedFbx[key]
    })
    this.renderer?.domElement.remove()
    this.renderer = null
  }

  addEffect(pass: Pass, camera: PerspectiveCamera) {
    if (this.effectComposer && this.renderer) {
      this.effectComposer.addPass(new pass(
        {
          width: this.renderer.domElement.clientWidth,
          height: this.renderer.domElement.clientHeight,
          scene: this.scene,
          camera,
        },
      ))
    }
  }

  render() {
    // Store the delta so it can be passed around (for consistency)
    const clockDelta = this.clock?.getDelta()
    // Run animations
    this.animationMixers?.forEach(mixer => mixer.update(clockDelta))
    // Run onRender subscriptions
    this.onRenderCallbacks?.forEach(cb => cb(clockDelta))
    // Render current frame only if camera available
    if (this.camera && this.scene) {
      // this.effect?.render(this.scene, this.camera)
      // this.renderer?.render(this.scene, this.camera)
      this.effectComposer?.render()
    }
    else {
      // console.error('No camera has been setup yet!')
    }
    // Next frame
    this.animationFrameId = requestAnimationFrame(() => this.render())
  }
}
