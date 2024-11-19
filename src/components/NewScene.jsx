import { Canvas } from '@react-three/fiber'
import { useGLTF, PointerLockControls } from '@react-three/drei'
import { FPSControls } from './Scene' // We'll need to export this from Scene.jsx
import * as THREE from 'three'

function Skybox() {
  // Using a different skybox for variety
  const { scene } = useGLTF('/skybox/quarry.glb') // You can change this to a different skybox
  return <primitive object={scene} scale={[1550, 1550, 1550]} />
}

function Platform() {
  return (
    <mesh position={[0, -42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  )
}

function FloatingCube({ position = [0, 0, 0] }) {
  return (
    <mesh position={position} userData={{ collidable: true }}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff0000" />
    </mesh>
  )
}

export default function NewScene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#111'
    }}>
      <Canvas shadows camera={{ 
        position: [0, -25, 0],
        fov: 100
      }}>
        <group>
          <Skybox />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff9f00" />
          <Platform />
          {/* Create some floating cubes as obstacles */}
          <FloatingCube position={[10, -35, 10]} />
          <FloatingCube position={[-15, -35, 20]} />
          <FloatingCube position={[20, -35, -15]} />
          <PointerLockControls />
          <FPSControls />
        </group>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/skybox/quarry.glb') 