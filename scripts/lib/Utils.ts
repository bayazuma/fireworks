class Utils {
  static TAU = 2 * Math.PI

  static degree2radian(degree: number): number {
    return (degree * Math.PI) / 180
  }

  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  static randomCircle() {
    const angle = Math.random()*Utils.TAU
    return [Math.cos(angle), Math.sin(angle)]
  }

   static randomSphere() {
    const xy = Utils.randomCircle()
    const rz = Math.random() * 2 - 1;
    const zSemicircle = Math.sqrt(1 - rz * rz);
    const rx = zSemicircle * xy[0];
    const ry = zSemicircle * xy[1];
    return [rx, ry, rz];
  }

  static calcCameraDistance(h: number, fov: number): number {
    const fovRad = Utils.degree2radian(fov / 2)
    return h / 2 / Math.tan(fovRad)
  }
}

export { Utils }