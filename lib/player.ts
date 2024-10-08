import type {World} from "~/lib/world";
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  LoopOnce,
  LoopRepeat,
  type Object3D,
  type SkinnedMesh,
  Vector3
} from "three";

export class Player {
  world: World
  speed: number
  bearing: number
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  ROTATION_OFFSET_Y: number
  dead: boolean
  model: SkinnedMesh | undefined
  animationMixer: AnimationMixer | undefined
  lastAnimation: string | undefined
  timeOfDeath: number | undefined

  constructor(world: World) {
    this.world = world;
    this.speed = 100.; // scalar, pos units per tick
    this.bearing = 0;
    this.moveForward = true;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.ROTATION_OFFSET_Y = 0;
    this.dead = false;

    this.attachControl();
    this.setupModel();
  }

  get position() {
    const model = this.model;
    return model ? model.position : new Vector3(0, 0, 0);
  }

  setupModel() {
    const world = this.world;
// fbx 找了免费能放的地方 我们自己的网站没有设定 CORS
    world.loadFbx('player', '/player@skateboarding.fbx', true);
    world.loadFbx('playerDying', '/player@dying.fbx', false);
    world.loadFbx('snowboard', '/snowboard.fbx', true);


    world.onLoaded(() => {
      const player = world.loadedFbx['player'];
      const playerDying = world.loadedFbx['playerDying'];
      const snowboard = world.loadedFbx['snowboard'];

      this.model = player;
      let footBone: Bone | undefined = undefined;
      player.traverse((child: Bone) => {
        if (child.type === 'Bone' &&
          child.name === 'mixamorigLeftFoot') {
            footBone = child;
        }
      });
      // Position camera, set the scale, etc
      snowboard.scale.set(4, 4, 4);
      footBone!.add(snowboard);
      snowboard.rotateX(-2.1);
      snowboard.rotateZ(-0.6);
      snowboard.translateX(0);
      snowboard.translateZ(13);

      player.traverse((m: Object3D) => {
        if (m.type === 'SkinnedMesh' ||
          m.type === 'Mesh') {
          m.castShadow = true;
        }
      });
      player.scale.set(0.1, 0.1, 0.1);
      player.rotation.x = Math.PI / 48;

      // Add the loaded animations to the base mesh
      // Name them for convenience
      player.animations[0].name = 'idle';
      playerDying.animations[0].name = 'dying';
      player.animations.push(...playerDying.animations);

      // Setup AnimationMixer for loaded model
      const mixer = new AnimationMixer(player);
      world.addAnimationMixer(mixer);
      this.animationMixer = mixer;

      // Reset clip durations
      player.animations.forEach((clip: AnimationClip) => {
        clip.resetDuration();
      });

      // Play idle animation
      this.playAnimation('idle');

      world.onRender((clockDelta: number) => this.move(clockDelta));
    });
  }

  attachControl(container = this.world.window) {
    let mouseDownRunning = false;
    container.addEventListener('keydown', event => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = true;
          this.moveBackward = false;
          break;
        case 'KeyS':
          // this.moveForward = false
          // this.moveBackward = true
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          this.moveRight = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveLeft = false;
          this.moveRight = true;
          break;}

    });
    container.addEventListener('keyup', event => {
      switch (event.code) {
        case 'KeyW':
          // if (!mouseDownRunning) this.moveForward = false
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;}

    });
    container.addEventListener('touchstart', event => {
      const touches = event.changedTouches;
      const touch = touches[0];
      if (touch.clientX < window.innerWidth / 2) {
        this.moveLeft = true;
        this.moveRight = false;
      } else {
        this.moveLeft = false;
        this.moveRight = true;
      }
    });
    container.addEventListener('touchend', event => {
      this.moveLeft = false;
      this.moveRight = false;
    });
  }

  playAnimation(name: string, loop = true) {
    if (this.lastAnimation === name) return;

    const loopMode = loop ? LoopRepeat : LoopOnce;

    const lastClip = AnimationClip.findByName(this.model!, this.lastAnimation);
    const nextClip = AnimationClip.findByName(this.model!, name);
    if (nextClip && this.animationMixer) {
      const existingAction = this.animationMixer.existingAction(lastClip);
      this.animationMixer.stopAllAction();
      const nextAction = this.animationMixer.clipAction(nextClip).
      setLoop(loopMode, Infinity);
      nextAction.clampWhenFinished = !loop;
      if (existingAction) {
        nextAction.play().crossFadeFrom(existingAction, 0.2, false);
      } else {
        nextAction.play();
      }
    }
    this.lastAnimation = name;
  }

  die() {
    this.timeOfDeath = this.world.clock?.elapsedTime;
    this.speed = -50;
    this.playAnimation('dying', false);
  }

  move(clockDelta: number) {
    if (this.dead) {
      return;
    }

    if (this.timeOfDeath &&
      this.world.clock!.elapsedTime! - this.timeOfDeath > 2.5) {
      this.dead = true;
    }

    // Must be run only AFTER animations are setup
    const t = clockDelta;
    const moveX = this.moveLeft || this.moveRight;
    const moveZ = this.moveForward || this.moveBackward;

    // Acceleration
    this.speed += t * 9.81;
    // Maximum velocity
    this.speed = Math.min(this.speed, 500);

    // Calculate displacement vectors
    let trueBearingX = t * this.speed * Math.cos(this.bearing + Math.PI / 2);
    let trueBearingZ = t * this.speed * Math.sin(this.bearing + Math.PI / 2);
    let perpBearingX = t * this.speed * Math.cos(this.bearing);
    let perpBearingZ = t * this.speed * Math.sin(this.bearing);

    // Forward & backward - mutually exclusive
    if (this.model) {
      if (this.moveForward) {
        // this.model.position.x += trueBearingX;
        this.model.position.z += trueBearingZ * Math.cos(this.model.rotation.y);
      } else if (this.moveBackward) {
        // this.model.position.x -= trueBearingX * 1 / 3.;
        // this.model.position.z -= trueBearingZ * 1 / 3.;
      }

      // Left & right
      if (this.moveLeft) {
        this.model.position.x += perpBearingX * Math.sin(this.model.rotation.y);
        this.model.position.z += perpBearingZ * Math.cos(this.model.rotation.y);
        this.model.rotation.y = this.model.rotation.y + Math.PI / 4 * t;
        this.model.rotation.z = Math.max(-Math.PI / 16, this.model.rotation.z - Math.PI / 2 * t);
      } else if (this.moveRight) {
        this.model.position.x += perpBearingX * Math.sin(this.model.rotation.y);
        this.model.position.z += perpBearingZ * Math.cos(this.model.rotation.y);
        this.model.rotation.y = this.model.rotation.y - Math.PI / 4 * t;
        this.model.rotation.z = Math.min(Math.PI / 16, this.model.rotation.z + Math.PI / 2 * t);
      } else {
        this.model.position.x += perpBearingX * Math.sin(this.model.rotation.y);
        this.model.position.z += perpBearingZ * Math.cos(this.model.rotation.y);
        // this.model.rotation.y -= this.model.rotation.y * 2 * t;
        this.model.rotation.z -= this.model.rotation.z * 2 * t;
      }
    }
  }}
