import { Canvas } from '@react-three/fiber'
import { useGLTF, PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function CollisionBox({ position, size = [2, 5, 2], onCollide }) {
  const meshRef = useRef()
  
  useFrame(() => {
    if (meshRef.current) {
      const boundingBox = new THREE.Box3().setFromObject(meshRef.current)
      
      const collidables = []
      meshRef.current.parent.traverse((object) => {
        if (object.userData.collidable) {
          collidables.push(object)
        }
      })
      
      collidables.forEach(object => {
        const objectBox = new THREE.Box3().setFromObject(object)
        if (boundingBox.intersectsBox(objectBox)) {
          if (onCollide) {
            onCollide({
              type: 'object',
              object: object,
              position: object.position.clone()
            })
          }
        }
      })
    }
  })

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      visible={false}
      userData={{ collidable: true }}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial wireframe opacity={0} transparent />
    </mesh>
  )
}

function Skybox() {
  const { scene } = useGLTF('/skybox/quarry.glb')
  return <primitive object={scene} scale={[1550, 1550, 1550]} />
}

function Model({ onNearModel }) {
  const modelRef = useRef()
  const { scene } = useGLTF('/models/reimu.glb')
  const { camera } = useThree()

  useFrame(() => {
    if (modelRef.current) {
      const distance = camera.position.distanceTo(new THREE.Vector3(50, 0, 50))
      const isNear = distance < 50
      console.log('Distance to Reimu:', distance, 'Is Near:', isNear)
      onNearModel(isNear)
    }
  })

  useEffect(() => {
    scene.traverse((object) => {
      object.userData.collidable = true
    })
  }, [scene])

  return (
    <group>
      <primitive 
        ref={modelRef}
        object={scene}
        scale={5}
        position={[50, 0, 50]}
      />
      <CollisionBox 
        position={[50, 0, 50]}
        size={[3, 6, 3]}
      />
    </group>
  )
}

function FPSControls() {
  const walkSpeed = 0.01
  const sprintSpeed = 0.03
  const keys = useRef({})
  const BOUNDARY_SIZE = 220
  
  const GRAVITY = 0.98
  const JUMP_FORCE = 0.1
  const velocity = useRef(0)
  const isGrounded = useRef(true)

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
    const { camera, scene } = state
    
    if (!camera || !scene) return

    const previousPosition = camera.position.clone()
    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3()
    const sideVector = new THREE.Vector3()
    const speed = keys.current['ShiftLeft'] ? sprintSpeed : walkSpeed

    if (keys.current['Space'] && isGrounded.current) {
      velocity.current = JUMP_FORCE
      isGrounded.current = false
    }

    velocity.current -= GRAVITY * 0.016
    camera.position.y += velocity.current

    if (camera.position.y <= -40) {
      camera.position.y = -40
      velocity.current = 0
      isGrounded.current = true
    }

    frontVector.setFromMatrixColumn(camera.matrix, 0)
    frontVector.crossVectors(camera.up, frontVector)
    sideVector.setFromMatrixColumn(camera.matrix, 0)

    direction.x = Number(keys.current['KeyD']) - Number(keys.current['KeyA'])
    direction.z = Number(keys.current['KeyS']) - Number(keys.current['KeyW'])
    direction.normalize()

    if (keys.current['KeyW']) camera.position.add(frontVector.multiplyScalar(speed))
    if (keys.current['KeyS']) camera.position.add(frontVector.multiplyScalar(-speed))
    if (keys.current['KeyA']) camera.position.add(sideVector.multiplyScalar(-speed))
    if (keys.current['KeyD']) camera.position.add(sideVector.multiplyScalar(speed))

    if (Math.abs(camera.position.x) > BOUNDARY_SIZE || 
        Math.abs(camera.position.z) > BOUNDARY_SIZE) {
      camera.position.copy(previousPosition)
    }

    const cameraBox = new THREE.Box3().setFromCenterAndSize(
      camera.position,
      new THREE.Vector3(0.05, 0.1, 0.05)
    )

    let hasCollision = false
    scene.traverse((object) => {
      if (object.userData.collidable) {
        const objectBox = new THREE.Box3().setFromObject(object)
        if (cameraBox.intersectsBox(objectBox)) {
          hasCollision = true
        }
      }
    })

    if (hasCollision) {
      camera.position.copy(previousPosition)
    }
  })

  return null
}

export default function Scene({ onSceneSwitch }) {
  const [isNearModel, setIsNearModel] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'KeyE' && isNearModel) {
        console.log('E pressed while near model')
        onSceneSwitch('new')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isNearModel, onSceneSwitch])

  useEffect(() => {
    console.log('Near model state changed:', isNearModel)
  }, [isNearModel])

  return (
    <>
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#111'
      }}>
        {isNearModel && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 99999,
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Press E to interact
          </div>
        )}
        <Canvas shadows camera={{ 
          position: [-50, -25, -50],
          fov: 100
        }}>
          <group>
            <Skybox />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff9f00" />
            <Model onNearModel={setIsNearModel} />
            <PointerLockControls />
            <FPSControls />
          </group>
        </Canvas>
      </div>
    </>
  )
}

useGLTF.preload('/models/reimu.glb')
useGLTF.preload('/skybox/quarry.glb')

export { FPSControls } 