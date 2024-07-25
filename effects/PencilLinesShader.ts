import {type PerspectiveCamera, ShaderMaterial, Vector2} from 'three'
import fragmentShader from './shaders/pencil-lines.frag'
import vertexShader from './shaders/pencil-lines.vert'
import type { GameEntity } from "~/effects/types";
import type { Sizes } from "~/effects/types";

export class PencilLinesShader extends ShaderMaterial implements GameEntity {
  constructor(camera: PerspectiveCamera, private sizes: Sizes) {
    super({
      uniforms: {
        uDiffuse: { value: null },
        uResolution: {
          value: new Vector2(1, 1),
        },
        uDepthBuffer: { value: null },
        uSurfaceBuffer: { value: null },
        uCameraNear: { value: camera.near },
        uCameraFar: { value: camera.far },

        uColorTexture: {
          value: {
            name: 'colorNoiseTexture',
            type: 'texture',
            path: 'textures/color-noise.png',
          },
        },
        uCloudTexture: {
          value: {
            name: 'cloudTexture',
            type: 'texture',
            path: 'textures/cloud-noise.png',
          },
        },
      },
      fragmentShader,
      vertexShader,
    })

    this.uniforms.uResolution.value = new Vector2(
      this.sizes.width,
      this.sizes.height
    )
  }

  update() {}

  resize() {
    this.uniforms.uResolution.value = new Vector2(
      this.sizes.width,
      this.sizes.height
    )
  }
}
