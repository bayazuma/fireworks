import * as THREE from 'three'
import { Utils } from './lib/Utils'
import { Trail } from './Trail'

type PropType = {
  texture: THREE.Texture
  position: THREE.Vector3
  delay: number
  lives: number[]
  hues: number[]
  randomRange: [number, number]
}

class Exploder {
  name: string
  group: THREE.Object3D

  startPos: THREE.Vector3
  vel: THREE.Vector3
  acc: THREE.Vector3
  delay: number

  lives: number[]
  lifeIndex = 0
  lifeInc: number
  isDead = false

  hues: number[]
  hueIndex: number
  hueNum: number

  r: number

  geometry: THREE.BufferGeometry
  material: THREE.SpriteMaterial
  texture: THREE.Texture
  mesh: THREE.Sprite

  trails: Trail[]

  containerW: number
  containerH: number

  constructor(props: PropType) {    
    this.name = 'Exploder'
    this.group = new THREE.Object3D()
    this.group.name = this.name + 'Group'

    this.startPos = props.position.clone()
    this.vel = new THREE.Vector3(...Utils.randomSphere())
    this.vel.y += 0.3
    this.vel.multiplyScalar(Utils.random(...props.randomRange))
    this.acc = new THREE.Vector3(0,0,0)

    this.delay = props.delay
    this.lives = props.lives
    this.lifeInc = -this.delay

    this.r = 10
    this.hues = props.hues
    this.hueNum = props.hues[0]
    this.hueIndex = 0

    this.texture = props.texture

    this.trails = []
  }

  create(): void {
    this.vertex()
    this.status()
    this.program()
    this.init()
  }

  init() {
    if (!this.mesh) {
      return
    }
    this.mesh.scale.set(this.r, this.r, 1)
  }

  createTrail() {
    const trail = new Trail(
      this.mesh.position,
      30,
      this.texture,
      this.hueNum%360,
    )
    this.trails.push(trail)
    this.group.add(trail.group)
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
      color: new THREE.Color(`hsl(${this.hues[0]}, 80%, 80%)`),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      alphaTest: 0,
      map: this.texture
    });
  }

  program(): void {
    this.mesh = new THREE.Sprite(this.material)
    this.mesh.position.set(this.startPos.x,this.startPos.y,this.startPos.z)
  }

  addForce(f:THREE.Vector3):void {
    this.acc.add(f)
  }

  alive () {
    return this.lifeInc >= 0
  }

  onUpdate(frame) {
    this.lifeInc += 1
    
    // delay
    if (!this.alive()) {
      return false
    }

    // once after delay
    if (this.group.children.length === 0) {
      this.group.add(this.mesh)
    }
    
    // set next life point
    if (this.lives[this.lifeIndex+1] < this.lifeInc) {
      this.lifeIndex++
    }

    // end
    if (this.lifeIndex+1 === this.lives.length) {
      this.isDead = true
      return false
    }

    // set span
    const fromLife = this.lives[this.lifeIndex]
    const toLife = this.lives[this.lifeIndex+1]
    const lifeSpan = toLife-fromLife
    const t = (this.lifeInc - fromLife)/lifeSpan

    /**
     * --------------------------
     * color
     * --------------------------
     */
    // fade out
    if (this.lifeIndex === this.lives.length-2) {      
      this.material.opacity = 1-t
      // wind force
      this.acc.add(new THREE.Vector3(-0.01,0,0))
    }

    // change hue
    const fromHue = this.hues[this.lifeIndex]
    const toHue = this.hues[this.lifeIndex+1]
    const hueSpan = toHue-fromHue
    this.hueNum = fromHue + hueSpan * t
    this.material.color = new THREE.Color(`hsl(${this.hueNum%360}, 100%, 50%)`)

    /**
     * --------------------------
     * location
     * --------------------------
     */
    this.vel.multiplyScalar(0.99) // slow down
    this.vel.add(this.acc)
    this.mesh.position.add(this.vel)
    this.acc.multiplyScalar(0)

    /**
     * --------------------------
     * trail
     * --------------------------
     */
    // create
    if (Math.random() < 0.7) {
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
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose(); 
  }
}

export {Exploder}
