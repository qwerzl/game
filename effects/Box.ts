import { TorusKnotGeometry, Mesh, MeshBasicMaterial } from 'three'

export class Box extends Mesh {
  constructor() {
    const geometry = new TorusKnotGeometry(1, 0.3, 200, 32)

    const material = new MeshBasicMaterial({
      color: 0x99dd99,
    })

    super(geometry, material)
  }
}
