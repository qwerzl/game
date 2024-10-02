import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'

import {type Group, LoadingManager} from "three";
import type {ShallowRef} from "vue";
import type {TresScene} from "@tresjs/core";
const loadedFbx = useState<Record<string, Group>>('loadedFbx')
const loadingManager = useState<LoadingManager>('loadingManager')

export default function(name: string, filename: string, scene: ShallowRef<TresScene>, addToScene = false) {
  const fbxLoader = new FBXLoader(loadingManager.value);
  console.log("fbxLoader", loadingManager.value)
  console.log("Loading FBX: " + filename);

  fbxLoader.load(
    filename,
    (object: Group) => {
      object.name = name;
      if (loadedFbx.value[name]) {
        console.log(`Warning: overwriting existing FBX '${name}'!`);
      }
      loadedFbx.value[name] = object;
      if (addToScene) scene.value.add(object);
    },

    (xhr: any) => {
      console.log(xhr.loaded/xhr.total*100 + '% loaded')
    },
    (error) => {
      console.error(error)
    });
}
