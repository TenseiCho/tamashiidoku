import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function Model() {
  const modelRef = useRef()
  const { scene } = useGLTF('/models/reimu.glb')

  useFrame((state, delta) => {
    // Optional: Add rotation animation
    modelRef.current.rotation.y += delta * 0.5
  })

  return (
    <primitive 
      ref={modelRef}
      object={scene}
      scale={1} // Adjust scale as needed
      position={[0, 0, 0]} // Adjust position as needed
    />
  )
}

export default function Scene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#111'
    }}>
      <Canvas shadows>
        <color attach="background" args={['#111']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff9f00" />
        <Model />
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}

// Add this at the bottom of the file
useGLTF.preload('/models/reimu.glb') 