import * as THREE from 'three'
import { Utils } from './lib/Utils'

class Trail {
  name: string
  group: THREE.Object3D

  pos = new THREE.Vector3(0,0,0)
  vel = new THREE.Vector3(0,0,0)
  acc = new THREE.Vector3(0,0,0)
  lifeSpan = 0

  r = 10
  hue = 0

  geometry: THREE.BufferGeometry
  material: THREE.SpriteMaterial
  texture: THREE.Texture
  mesh: THREE.Sprite

  constructor(
    pos:THREE.Vector3,
    lifeSpan:number,
    texture: THREE.Texture,
    hue: number
  ) {
    this.name = 'Trail'
    this.group = new THREE.Object3D()
    this.group.name = this.name + 'Group'

    this.pos = pos
    const randomVel = Utils.randomSphere()
    const randomVelScale = 0.4
    this.vel.set(
      randomVel[0] * randomVelScale,
      randomVel[1] * randomVelScale,
      randomVel[2] * randomVelScale,
    )
    this.lifeSpan = lifeSpan
    this.hue = hue
    this.texture = texture

    this.create()
    this.init()
  }

  create() {
    this.vertex()
    this.status()
    this.program()
    this.init()
    this.group.add(this.mesh)
  }

  init() {
    if (!this.mesh) return
    this.mesh.scale.set(this.r,this.r,this.r)
  }

  vertex(): void {
    this.geometry = new THREE.BufferGeometry();
    const w = 1
    const h = 1
    const halfW = w*0.5
    const halfH = h*0.5
    var vertices = new Float32Array([
      -halfW, halfH,0,
       halfW, halfH,0,
      -halfW,-halfH,0,
       halfW,-halfH,0,
    ])
    var indices = new Uint16Array([
      0,2,1,
      1,2,3
    ])
    this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.geometry.setIndex(new THREE.BufferAttribute(indices,1));
  }

  status(): void {
    this.material = new THREE.SpriteMaterial({
      color: new THREE.Color(`hsl(${this.hue}, 80%, 80%)`),
      transparent: true,
      alphaTest: 0,
      map: this.texture
    })
  }
  program(): void {
    this.mesh = new THREE.Sprite(this.material)
    this.mesh.position.set(this.pos.x,this.pos.y,this.pos.z)
  }

  addForce(force: THREE.Vector3) {
    this.acc.add(force)
  }

  syncParentOpacity(parentOpacity) {
    const mixOpacity = Math.min(this.lifeSpan, parentOpacity)
    const finalOpacity = Math.min(mixOpacity, 0.3)
    this.material.opacity = finalOpacity
  }

  isDead() {
    return this.lifeSpan < 0
  }

  onUpdate(frame:number) {
    if (this.isDead()) return false

    this.vel.add(this.acc)
    this.mesh.position.add(this.vel)
    this.acc.multiplyScalar(0)

    this.lifeSpan -= 1

    // fade
    // use syncParentOpacity 
    // this.material.opacity = Math.min(this.lifeSpan, 0.3)
  }

  onResize(w:number, h:number) {
    // this.init()
  }

  destroy() {
    this.group.remove(this.mesh)
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}

export {Trail}