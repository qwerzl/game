import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import {PerspectiveCamera, Scene, type WebGLRenderer} from 'three'
import {
  HalfFloatType,
  MeshNormalMaterial,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget,
} from 'three'
import { PencilLinesShader } from './PencilLinesShader'

import type { Sizes } from "~/effects/types";

export class PencilLinesPass extends Pass {
  fsQuad: FullScreenQuad
  material: PencilLinesShader
  normalMaterial: MeshNormalMaterial

  surfaceBuffer: WebGLRenderTarget

  constructor(private sizes: Sizes, private camera: PerspectiveCamera, private scene: Scene) {
    super()

    this.fsQuad = new FullScreenQuad()
    this.material = new PencilLinesShader(this.camera, sizes)

    this.fsQuad.material = this.material

    const surfaceBuffer = new WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height
    )
    surfaceBuffer.texture.format = RGBAFormat
    surfaceBuffer.texture.type = HalfFloatType
    surfaceBuffer.texture.minFilter = NearestFilter
    surfaceBuffer.texture.magFilter = NearestFilter
    surfaceBuffer.texture.generateMipmaps = false
    surfaceBuffer.stencilBuffer = false
    this.surfaceBuffer = surfaceBuffer

    this.normalMaterial = new MeshNormalMaterial()

    this.material.uniforms.uCameraNear.value = this.camera.near
    this.material.uniforms.uCameraFar.value = this.camera.far
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget
  ) {
    const depthBuffer = writeBuffer.depthBuffer
    writeBuffer.depthBuffer = false

    renderer.setRenderTarget(this.surfaceBuffer)
    const overrideMaterialValue = this.scene.overrideMaterial

    this.scene.overrideMaterial = this.normalMaterial
    renderer.render(this.scene, this.camera)
    this.scene.overrideMaterial = overrideMaterialValue

    this.material.uniforms.uDiffuse.value = readBuffer.texture
    this.material.uniforms.uDepthBuffer.value = readBuffer.depthTexture
    this.material.uniforms.uSurfaceBuffer.value = this.surfaceBuffer.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }

    writeBuffer.depthBuffer = depthBuffer
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }

  setSize() {
    this.material.resize()
  }
}
