import * as THREE from 'three'
import { Utils } from './lib/Utils'
import { Trail } from './Trail'

class Fire {
  name: string
  group: THREE.Object3D

  vel: THREE.Vector3
  acc: THREE.Vector3
  sinOffset: number
  sinIntensity: number
  angle: number
  rotateDir: number
  rotateSpeed: number

  r: number
  hue: number

  geometry: THREE.BufferGeometry
  material: THREE.SpriteMaterial
  texture: THREE.Texture
  mesh: THREE.Sprite

  trails: Trail[]

  exploded = false

  containerW: number
  containerH: number

  constructor({texture, hue}) {
    this.name = 'Fire'
    this.group = new THREE.Object3D()
    this.group.name = this.name + 'Group'

    this.vel = new THREE.Vector3(0,5,0)
    this.acc = new THREE.Vector3(0,0,0)
    this.sinOffset = 0
    this.sinIntensity = 0.1

    this.r = 10

    this.hue = hue
    this.texture = texture

    this.trails = []
  }

  create(): void {
    this.vertex()
    this.status()
    this.program()
    this.init()
    this.group.add(this.mesh);
  }

  createTrail() {
    const trail = new Trail(
      this.mesh.position,
      30,
      this.texture,
      this.hue,
    )
    this.group.add(trail.group)
    this.trails.push(trail)
  }

  init() {
    if (!this.mesh) return

    this.mesh.position.set(
      this.containerW/2 * Utils.random(-0.5, 0.5),
      -(this.containerH/2) - this.r,
      0,
    )
    this.mesh.scale.set(this.r, this.r, this.r)
  }

  vertex(): void {
    this.geometry = new THREE.BufferGeometry()
    const w = 1
    const h = 1
    const halfW = w*0.5
    const halfH = h*0.5
    let vertices = new Float32Array([
      -halfW, halfH,0,
       halfW, halfH,0,
      -halfW,-halfH,0,
       halfW,-halfH,0,
    ])
    let indices = new Uint16Array([
      0,2,1,
      1,2,3
    ])
    this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    this.geometry.setIndex(new THREE.BufferAttribute(indices,1))
  }

  status(): void {
    this.material = new THREE.SpriteMaterial({
      color: new THREE.Color(`hsl(${this.hue}, 80%, 80%)`),
      transparent: true,
      alphaTest: 0.1,
      map: this.texture
    });
  }

  program(): void {
    this.mesh = new THREE.Sprite(this.material)
  }

  addForce(f:THREE.Vector3):void {
    this.acc.add(f)
  }

  onUpdate(frame: number) {

    /**
     * --------------------------
     * fire
     * --------------------------
     */

    // location
    this.vel.add(this.acc)
    this.mesh.position.add(this.vel)
    this.acc.multiplyScalar(0)

    // wave
    this.sinOffset = Math.sin(frame * 0.2) * this.r * this.sinIntensity
    this.mesh.position.x += this.sinOffset

    // reach the top
    if (!this.exploded && this.vel.y <= 0 ) {
      this.exploded = true
    }
    
    /**
     * --------------------------
     * trail
     * --------------------------
     */

    // create 
    if (Math.random() < 0.8) {
      this.createTrail()
    }
    // update
    for (const trail of this.trails) {
      const gravity = new THREE.Vector3(0,-0.01,0)
      trail.addForce(gravity)
      trail.syncParentOpacity(this.material.opacity)
      trail.onUpdate(frame)
    }
    // remove
    for (let i = this.trails.length-1; i >= 0; i--) {
      const trail = this.trails[i];
      if (trail.isDead()) {
        trail.destroy()
        this.group.remove(trail.group)
        this.trails.splice(i, 1)
      }
    }
  }

  onResize(w:number, h:number) {
    this.containerW = w
    this.containerH = h
    this.init()
  }

  destroy() {
    this.group.remove(this.mesh)
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}

export {Fire}
