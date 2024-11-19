import { Html } from '@react-three/drei'
import { useState } from 'react'

function PortfolioZone({ position, title, content }) {
  const [isActive, setIsActive] = useState(false)

  return (
    <group position={position}>
      {/* Interactive platform */}
      <mesh 
        onPointerEnter={() => setIsActive(true)}
        onPointerLeave={() => setIsActive(false)}
      >
        <cylinderGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color={isActive ? "#00ff00" : "#ffffff"} />
      </mesh>

      {/* Floating title */}
      <Html position={[0, 2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
          width: '200px',
          textAlign: 'center'
        }}>
          <h2>{title}</h2>
          {isActive && (
            <div>
              <p>My work in {title}</p>
              <button onClick={() => window.open(content.link)}>
                View Projects
              </button>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
} 