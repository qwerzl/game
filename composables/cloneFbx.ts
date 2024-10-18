import { Skeleton } from 'three'

export function cloneFbx(fbx: any) {
  const clone = fbx.clone(true)
  clone.animations = fbx.animations
  clone.skeleton = { bones: [] }

  const skinnedMeshes: any = {}

  fbx.traverse((node: any) => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node
    }
  })

  const cloneBones = {}
  const cloneSkinnedMeshes = {}

  clone.traverse((node: any) => {
    if (node.isBone) {
      cloneBones[node.name] = node
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node
    }
  });

  for (const name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name]
    const skeleton = skinnedMesh.skeleton
    const cloneSkinnedMesh = cloneSkinnedMeshes[name]

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; i++) {
      const cloneBone = cloneBones[skeleton.bones[i].name]
      orderedCloneBones.push(cloneBone)
    }

    cloneSkinnedMesh.bind(
      new Skeleton(orderedCloneBones, skeleton.boneInverses),
      cloneSkinnedMesh.matrixWorld,
    )

    // For animation to work correctly:
    clone.skeleton.bones.push(cloneSkinnedMesh)
    clone.skeleton.bones.push(...orderedCloneBones)
  }

  return clone
}
