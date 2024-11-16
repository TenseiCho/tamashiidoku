import { Canvas } from '@react-three/fiber'
import { useGLTF, PointerLockControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

function Skybox() {
  const { scene } = useGLTF('/skybox/quarry.glb')
  return <primitive object={scene} scale={[1550, 1550, 1550]} />
}

function Model() {
  const modelRef = useRef()
  const { scene } = useGLTF('/models/reimu.glb')

  useFrame((state, delta) => {
    modelRef.current.rotation.y += delta * 0.5
  })

  return (
    <primitive 
      ref={modelRef}
      object={scene}
      scale={5}
      position={[0, 0, 0]}
    />
  )
}

function FPSControls() {
  const moveSpeed = 0.5
  const keys = useRef({})
  const BOUNDARY_SIZE = 220 // Slightly less than half the skybox scale (450/2 = 225)

  useEffect(() => {
    const handleKeyDown = (e) => keys.current[e.code] = true
    const handleKeyUp = (e) => keys.current[e.code] = false

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state) => {
    const { camera } = state
    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3()
    const sideVector = new THREE.Vector3()
    const speed = moveSpeed

    frontVector.setFromMatrixColumn(camera.matrix, 0)
    frontVector.crossVectors(camera.up, frontVector)

    sideVector.setFromMatrixColumn(camera.matrix, 0)

    direction.x = Number(keys.current['KeyD']) - Number(keys.current['KeyA'])
    direction.z = Number(keys.current['KeyS']) - Number(keys.current['KeyW'])
    direction.normalize()

    // Store the current position before moving
    const previousPosition = camera.position.clone()

    // Apply movement
    if (keys.current['KeyW']) camera.position.add(frontVector.multiplyScalar(speed))
    if (keys.current['KeyS']) camera.position.add(frontVector.multiplyScalar(-speed))
    if (keys.current['KeyA']) camera.position.add(sideVector.multiplyScalar(-speed))
    if (keys.current['KeyD']) camera.position.add(sideVector.multiplyScalar(speed))

    // Check boundaries and revert if out of bounds
    if (Math.abs(camera.position.x) > BOUNDARY_SIZE || 
        Math.abs(camera.position.z) > BOUNDARY_SIZE ||
        Math.abs(camera.position.y) > BOUNDARY_SIZE) {
      camera.position.copy(previousPosition)
    }
  })

  return null
}

export default function Scene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#111'
    }}>
      <Canvas shadows camera={{ position: [0, 0.5, 10] }}>
        <Skybox />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff9f00" />
        <Model />
        <PointerLockControls />
        <FPSControls />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/reimu.glb')
useGLTF.preload('/skybox/quarry.glb') 