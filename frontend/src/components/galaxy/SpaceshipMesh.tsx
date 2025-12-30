"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function SpaceshipMesh() {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF("/SpaceShuttle.glb");

    // Subtle ship vibration/sway
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(t * 2) * 0.02;
        groupRef.current.rotation.z = Math.sin(t * 1) * 0.01;
    });

    return (
        <group ref={groupRef} position={[0, -1.2, -3.5]} scale={[0.01, 0.01, 0.01]}>
            <primitive object={scene.clone()} />
            {/* Engine Glow */}
            <pointLight position={[0, -0.5, 2.0]} intensity={0.2} color="#fab387" />
        </group>
    );
}

// Preload the model
useGLTF.preload("/SpaceShuttle.glb");
