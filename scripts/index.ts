import "regenerator-runtime/runtime";
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {Fireworks} from './Fireworks'
import { Utils } from "./lib/Utils";

class Main {
  container: HTMLElement
  width: number
  height: number
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  orbitControls: OrbitControls
  fireworks: Fireworks

  frame = 0
  isPlaying = false

  axesHelper?: THREE.AxesHelper
  gridHelper?: THREE.GridHelper

  constructor(options) {
    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.scene = new THREE.Scene()

    const fov = 50
    const distance = Utils.calcCameraDistance(this.height, fov)
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width/this.height,
      0.1,
      5000
    )
    this.camera.position.set(0, 0, distance)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)
    this.container.appendChild(this.renderer.domElement)
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    this.addObjects()
    this.resize()
    this.eventAttach()
    // this.play()
  }

  eventAttach() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addObjects() {
    this.fireworks = new Fireworks()
    this.scene.add(this.fireworks.group)

    this.axesHelper = new THREE.AxesHelper(1);
    this.axesHelper.visible = false
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(1, 10);
    this.gridHelper.visible = false
    this.scene.add(this.gridHelper);
  }

  pause() {
    this.isPlaying = false
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true
      this.render()
    }
  }

  render() {
    if(!this.isPlaying) return

    const maxFps = 50
    setTimeout(() => {
      window.requestAnimationFrame(this.render.bind(this))
    }, 1000 / maxFps)

    this.update()

    this.renderer.render(this.scene, this.camera)
  }

  update() {
    // interval
    if(this.frame % 360 === 0) {
      this.fireworks.createFire()
    }

    this.fireworks.onUpdate(this.frame)
    this.orbitControls.update()

    this.frame += 1
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.fireworks.onResize(this.width, this.height)

    this.renderer.setSize(this.width, this.height)


    const distance = Utils.calcCameraDistance(this.height, this.camera.fov)
    this.camera.aspect = this.width / this.height
    this.camera.position.z = distance + 200
    this.camera.updateProjectionMatrix()

    const w = this.width
    if (this.axesHelper) {
      this.axesHelper.scale.set(w,w,w)
    }
    if (this.gridHelper) {
      this.gridHelper.scale.set(w,w,w)
    }
  }
}

const main = new Main({
  dom: document.getElementById('container')
})


let gui = new GUI();
gui.add(main, 'play')
gui.add(main, 'pause')

gui.add(main.fireworks, 'lgExplosionAmount', 10, 90, 1)
gui.add(main.fireworks, 'smExplosionAmount', 10, 40, 1)
gui.add(main.fireworks, 'smFireworksNum', 2, 6, 1)

main.orbitControls.autoRotate = true
main.orbitControls.autoRotateSpeed = 2.8
gui.add(main.orbitControls, 'autoRotate')
gui.add(main.axesHelper, 'visible').name('axes visible')
gui.add(main.gridHelper, 'visible').name('grid visible')

// gui.close()

