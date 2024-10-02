import { World } from "~/lib/world";
import { Player } from "~/lib/player";
import {
  Box3,
  BoxGeometry,
  Fog,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial, MeshStandardMaterial,
  RepeatWrapping,
  type Texture,
  TextureLoader
} from "three";
import { cloneFbx } from "~/composables/cloneFbx";

export class Mountain {
  world: World
  player: Player
  N_VISIBLE_TREES: number
  TREES_LOD: number
  STAGE_WIDTH: number
  STAGE_LENGTH: number
  trees: any[]
  grounds: any[]
  groundCount: number
  snowMap: Texture

  constructor(world: World, player: Player) {
    this.world = world;
    this.player = player;

    this.N_VISIBLE_TREES = 50;
    this.TREES_LOD = 1000;
    this.STAGE_WIDTH = 750;
    this.STAGE_LENGTH = 10000;
    this.trees = [];
    this.groundCount = 0;
    this.grounds = [];

    const snowMap = new TextureLoader().load('https://repo.bfw.wiki/bfwrepo/images/ski/snow.jpg');
    snowMap.wrapS = RepeatWrapping;
    snowMap.wrapT = RepeatWrapping;
    snowMap.repeat.set(this.STAGE_WIDTH / 100, this.STAGE_LENGTH / 100);
    this.snowMap = snowMap;

    // Fog
    // this.world.scene!.fog = new Fog(0xeeeeee, 100, this.TREES_LOD);

    this.world.loadFbx('tree', '/PineTree_003.fbx', false);
    // this.world.loadFbx('tree', 'fbx/tree.gltf', false);
    //this.world.loadFbx('tree', 'http://www.dhcofi.com/wp-content/uploads/2024/07/tree.fbx', false);
    this.world.onLoaded(() => {
      // Create first ground iteration
      this.createGround();
      const tree = this.world.loadedFbx['tree'];
      tree.scale.set(0.5, 0.5, 0.5);
      tree.traverse(m => {
        if (m.type === 'SkinnedMesh' ||
          m.type === 'Mesh') {
          m.castShadow = true;
        }
      });
      tree.rotation.x = -Math.PI / 16;
      tree.position.y = -10;
      tree.children[0].material;
      this.world.onRender(t => this.render(t));
    });
  }

  createGround() {
    // Ground
    const groundGeo = new BoxGeometry(this.STAGE_WIDTH, 100, this.STAGE_LENGTH);
    const groundMat = new MeshStandardMaterial({ color: 0xfdedd7 });
    const ground = new Mesh(groundGeo, groundMat);
    console.log(ground)
    ground.receiveShadow = true;
    this.world.scene!.add(ground);
    ground.position.y -= 50;

    // Mountains (sidewalls)
    const mountainGeo = new BoxGeometry(1000, 100, this.STAGE_LENGTH);
    const mountainMat = new MeshBasicMaterial({ color: 0xfdedd7 });
    const leftWall = new Mesh(mountainGeo, mountainMat);
    this.world.scene!.add(leftWall);
    leftWall.position.x += this.STAGE_WIDTH - 100;
    leftWall.position.y += 150;
    leftWall.rotation.z = Math.PI / 4;
    const rightWall = new Mesh(mountainGeo, mountainMat);
    this.world.scene!.add(rightWall);
    rightWall.position.x -= this.STAGE_WIDTH - 100;
    rightWall.position.y = 150;
    rightWall.rotation.z = -Math.PI / 4;

    ground.position.z += this.groundCount * this.STAGE_LENGTH + this.STAGE_LENGTH / 2;
    leftWall.position.z += this.groundCount * this.STAGE_LENGTH + this.STAGE_LENGTH / 2;
    rightWall.position.z += this.groundCount * this.STAGE_LENGTH + this.STAGE_LENGTH / 2;

    this.grounds.push({ index: this.groundCount++, ground, leftWall, rightWall });
  }

  disposeGround(index: number) {
    // TODO: check proper disposal
    const grounds = this.grounds;
    let ground = grounds.find(g => g.index === index);
    this.world.scene!.remove(ground);
    grounds.splice(grounds.indexOf(ground), 1);
    ground.ground.traverse(t => {
      if (typeof t.dispose === 'function') {
        t.dispose();
      }
    });
    ground.leftWall.traverse(t => {
      if (typeof t.dispose === 'function') {
        t.dispose();
      }
    });
    ground.rightWall.traverse(t => {
      if (typeof t.dispose === 'function') {
        t.dispose();
      }
    });
    ground = null;
  }

  addTree() {
    // must be called after onLoaded
    const world = this.world;
    const treeBase = world.loadedFbx['tree'];
    const tree = cloneFbx(treeBase);
    this.trees.push(tree);
    world.scene!.add(tree);

    // Calculate random position
    const p = this.player;
    const x = Math.random() * this.STAGE_WIDTH - this.STAGE_WIDTH / 2;
    const z = p.position.z + this.TREES_LOD * (3 / 4) + Math.random() * this.TREES_LOD * 2;
    Object.assign(tree.position, { x, z });

    // Precalc intersection bounding box
    const treeGeo = new BoxGeometry(25, 200, 25);
    const treeBoundingMesh = new Mesh(treeGeo);
    Object.assign(treeBoundingMesh.position, tree.position);
    const treeBox = new Box3().setFromObject(treeBoundingMesh);
    tree.collisionBoundingBox = treeBox;

    return tree;
  }

  disposeTree(tree) {
    // TODO: check proper disposal
    const trees = this.trees;
    this.world.scene!.remove(tree);
    trees.splice(trees.indexOf(tree), 1);
    tree.traverse(t => {
      if (typeof t.dispose === 'function') {
        t.dispose();
      }
    });
    tree = null;
  }

  checkCollision() {
    const trees = this.trees;
    const player = this.player;
    const playerBox = new Box3().setFromObject(player.model);

    if (player.position.x < -this.STAGE_WIDTH / 2 ||
      player.position.x > this.STAGE_WIDTH / 2) {
      player.die();
    }

    trees.forEach(tree => {
      const intersects = playerBox.intersectsBox(tree.collisionBoundingBox);
      if (intersects) {
        player.die();
      }
    });
  }

  render(t) {
    const p = this.player;
    let trees = this.trees.slice();

    this.checkCollision();

    // Cull trees behind player
    trees = trees.filter(tree => {
      if (tree.position.z < p.position.z - this.TREES_LOD) {
        this.disposeTree(tree);
        return false;
      } else {
        return true;
      }
    });

    // Refill trees if needed
    if (trees.length < this.N_VISIBLE_TREES) {
      for (let i = trees.length; i < this.N_VISIBLE_TREES; i++) {
        const tree = this.addTree();
      }
    }

    // Refill ground
    if (Math.ceil(p.position.z / this.STAGE_LENGTH + 0.5) > this.groundCount) {
      this.disposeGround(this.groundCount - 1);
      this.createGround();
    }
  }}