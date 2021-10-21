import * as THREE from 'three'
import t from '../img/linearParticle.png'

import { Fire } from './Fire'
import { Exploder } from './Exploder'
import { Utils } from './lib/Utils'

class Fireworks {
  name:string
  group: THREE.Object3D
  fires: Fire[]
  exploders: Exploder[]
  texture: THREE.Texture
  gravF: THREE.Vector3

  containerW: number
  containerH: number

  lgExplosionAmount = 64
  smExplosionAmount = 18
  smFireworksNum = 3

  constructor() {
    this.name = 'Fireworks'
    this.group = new THREE.Object3D()
    this.group.name = this.name + 'Group'
    this.gravF = new THREE.Vector3(0,-0.03,0)

    this.fires = []
    this.exploders = []

    this.texture = new THREE.TextureLoader().load(t)
  }

  createFire(): any {  
    const fire = new Fire({
      texture: this.texture,
      hue: Utils.random(50, 240)
    })
    fire.create()
    fire.onResize(this.containerW, this.containerH)
    this.group.add(fire.group)
    this.fires.push(fire)
  }

  createExploder(position: THREE.Vector3, hue: number): any {  
    for (let index = 0; index < this.lgExplosionAmount; index++) {
      // large exploder
      const exploder = new Exploder({
        texture: this.texture,
        position: position,
        delay: 0,
        lives: [0  , 50 , 90    , 150   , 170    , 300    ],
        hues:  [hue, hue, hue+40, hue+40, hue+300, hue+300],
        randomRange: [3, 6]
      })
      exploder.create()
      exploder.onResize(this.containerW, this.containerH)
      this.group.add(exploder.group)
      this.exploders.push(exploder)

      // medium exploder
      const exploder2 = new Exploder({
        texture: this.texture,
        position: position,
        delay: 20,
        lives: [0     , 50    , 190    , 290   ],
        hues:  [hue+40, hue+40, hue+300, hue+300],
        randomRange: [3, 5]
      })
      exploder2.create()
      exploder2.onResize(this.containerW, this.containerH)
      this.group.add(exploder2.group)
      this.exploders.push(exploder2)
    }

    // small exploders
    for (let i = 0; i < this.smFireworksNum; i++) {
      const radian = Utils.degree2radian(360 * i /this.smFireworksNum)
      const rLength = 150
      const pos = new THREE.Vector3(Math.cos(radian)*rLength, Math.sin(radian)*rLength, 0)
      pos.add(new THREE.Vector3(0,-30,0)) // adjust lag
      const delay = Utils.random(40, 80)
      for (let j = 0; j < this.smExplosionAmount; j++) {
        const exploder = new Exploder({
          texture: this.texture,
          position: position.clone().add(pos),
          delay: 160-delay,
          lives: [0,  100],
          hues:  [30, 40 ],
          randomRange: [2, 3]
        })
        exploder.create()
        exploder.onResize(this.containerW, this.containerH)
        this.group.add(exploder.group)
        this.exploders.push(exploder)
      }
    }
  }

  onUpdate(frame:number) {

    /**
     * --------------------------
     * launch
     * --------------------------
     */
    // update
    for (const fire of this.fires) {
      fire.addForce(this.gravF)
      fire.onUpdate(frame) 
      if (fire.exploded) {
        this.createExploder(fire.mesh.position, fire.hue)
      }
    }

    // remove
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const fire = this.fires[i];
      if (fire.exploded) {
        fire.destroy()
        this.group.remove(fire.group)
        this.fires.splice(i, 1)
      }
    }

    /**
     * --------------------------
     * explosion
     * --------------------------
     */

    // update
    for (const exploder of this.exploders) {
      if (exploder.alive()) {
        exploder.addForce(this.gravF)
      }
      exploder.onUpdate(frame) 
    }

    // delete
    for (let i = this.exploders.length - 1; i >= 0; i--) {
      const exploder = this.exploders[i];
      if (exploder.isDead) {
        exploder.destroy()
        this.group.remove(exploder.group)
        this.exploders.splice(i, 1)
      }
    }
  }

  onResize(w:number, h:number) {
    this.containerW = w
    this.containerH = h
    for (const fire of this.fires) {
      fire.onResize(w, h) 
    }
    for (const exploder of this.exploders) {
      exploder.onResize(w, h) 
    }
  }
}

export {Fireworks}
