import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'


/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor').onChange(() => {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

// if the gradient texture consists of three gradient, instead of mapping the in-between gradients only go for the nearest map/color
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Objects
 */

// Material
const material = new THREE.MeshToonMaterial({color: parameters.materialColor, gradientMap: gradientTexture});


// Meshes

const objectsDistance = 4;

const mesh1 = new THREE.Mesh(
    new THREE.TorusBufferGeometry(1,.4,16, 60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeBufferGeometry(1,2,32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotBufferGeometry(.8,.35,100,16),
    material
)

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;


scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1,mesh2,mesh3]

/**
 * Particles
 */
// Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++){
    positions[i * 3 + 0] = (Math.random() - .5) * 10;
    positions[i * 3 + 1] = objectsDistance * .5 - Math.random() * objectsDistance * sectionMeshes.length;
    positions[i * 3 + 2] = (Math.random() - .5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

//  Material

const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

// Points

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)





// Lights

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)

directionalLight.position.set(1,1,0)

scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scroll

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY/sizes.height);
    if(newSection !== currentSection){
        currentSection = newSection;

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration:1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'        
            }
        )

    }
})

// Cursor

let cursor = {
    x: 0, 
    y: 0
}

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX/sizes.width - .5;
    cursor.y = e.clientY/sizes.height - .5;
})

/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTIme = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTIme;
    previousTIme = elapsedTime;

    // Animate camera
    camera.position.y = -(scrollY/sizes.height) * objectsDistance;

    // parallax
    const parallaxX = cursor.x;
    const parallaxY = -cursor.y;

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime
    // Animate meshes
    sectionMeshes.forEach(e => {
        e.rotation.x += deltaTime *.1;
        e.rotation.y += deltaTime *.12;
    })


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()