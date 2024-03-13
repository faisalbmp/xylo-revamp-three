import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import colorfulTexture from './images/image.jpg'
// import liberty from './models/scene.gltf'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()
  const loader = new GLTFLoader();
  // loader.load( liberty, function ( gltf ) {

  //   scene.add( gltf.scene );
  
  // }, undefined, function ( error ) {
  
  //   console.error( error );
  
  // } );
        // Define grid dimensions
        const widthSegments = 10;
        const heightSegments = 10;
  // settings
  const MOTION_BLUR_AMOUNT = 0.725

  // lighting
  const dirLight = new THREE.DirectionalLight('#ffffff', 0.75)
  dirLight.position.set(5, 5, 5)

  const ambientLight = new THREE.AmbientLight('#ffffff', 0.2)
  scene.add(dirLight, ambientLight)
  let count = 10000
  // meshes
  // const geometry = new THREE.PlaneGeometry(2,2,2,2);
  let particlegeo = new THREE.PlaneGeometry(1,1)
  let geo = new THREE.InstancedBufferGeometry();
  let particleGeometry = new THREE.InstancedBufferGeometry().copy(particlegeo);
  
// const geometry = new THREE.BoxGeometry(1, 1, 1);

        // Particle Geometry
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const numParticles = 100;
        for (let i = 0; i < numParticles; i++) {
            const x = (Math.random() * 2 - 1);
            const y = (Math.random() * 2 - 1);
            const z = (Math.random() * 2 - 1);
            positions.push(x, y, z);
        }
        
  let pos = new Float32Array(numParticles*3)
  for(let i = 0; i<numParticles; i++){
    let x= (Math.random()-0.5)*0.5
    let y= (Math.random()-0.5)*0.5
    let z= (Math.random()-0.5)*0.5
    pos.set({
      x,y,z
    },i*3)
  }
  
        // Create vertices and offsets
        const vertices = [];
        const offsets = [];
        for (let y = 0; y <= heightSegments; y++) {
            const yPos = (y / heightSegments - 0.5) * height;
            for (let x = 0; x <= widthSegments; x++) {
                const xPos = (x / widthSegments - 0.5) * width;
                vertices.push(xPos, yPos, 0);
                const offsetX = Math.random() * 20 - 10;
                const offsetY = Math.random() * 20 - 10;
                const offsetZ = Math.random() * 20 - 10;
                offsets.push(offsetX, offsetY, offsetZ);
            }
        }

        // geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        // geometry.setAttribute('offsetPosition', new THREE.Float32BufferAttribute(offsets, 3));

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        // particleGeometry.setAttribute('position', particlegeo.getAttribute('position'));
        particleGeometry.setAttribute('pos', new THREE.InstancedBufferAttribute(pos,3));
  geo.instanceCount = count;
  // geo.setAttribute('position',new THREE.BufferAttribute( vertices, 3 ) )
  geo.setAttribute('position',particleGeometry.getAttribute('offsetPosition'))
  console.log('geometry',geometry.getAttribute('position'))
  console.log('particlegeo',particlegeo.getAttribute('position'))
  console.log('particleGeometry',particleGeometry.getAttribute('position'))
  geo.index = particlegeo.index;
  geo.setAttribute('pos',new THREE.InstancedBufferAttribute(pos,3,false))

        // Particle Material
        const material = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 } },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
      });
  material.uniforms.time = {value: 0}
  material.uniforms.uRadius = {value : 0.5}
  material.uniforms.uTexture = {value: new THREE.TextureLoader().load(colorfulTexture)}

  const ico = new THREE.Points(geometry, material)
  scene.add(ico)

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  gui.add(material.uniforms.uRadius, "value").min(0).max(1)

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // save pass
  const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // blend pass
  const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // output pass
  const outputPass = new ShaderPass(CopyShader)
  outputPass.renderToScreen = true

  // adding passes to composer
  // addPass(blendPass)
  // addPass(savePass)
  // addPass(outputPass)

  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 1000
    material.uniforms.time.value = time
  })
}

export default startApp
