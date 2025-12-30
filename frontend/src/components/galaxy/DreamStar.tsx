"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface DreamStarProps {
    id: string;
    title: string;
    category: string;
    position: [number, number, number];
    completed?: boolean;
    onClick: (id: string) => void;
    onHover?: (hovered: boolean) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    "Career & Business": "#3b82f6", // Blue
    "Finance & Wealth": "#eab308", // Yellow
    "Health & Wellness": "#22c55e", // Green
    "Relationships & Family": "#ef4444", // Red
    "Travel & Adventure": "#f97316", // Orange
    "Skills & Knowledge": "#a855f7", // Purple
    "Lifestyle & Hobbies": "#ec4899", // Pink
    "Other": "#94a3b8", // Slate
};

export function DreamStar({ id, title, category, position, completed, onClick, onHover }: DreamStarProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const haloRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    
    // For entrance animation
    const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);
    const currentPos = useRef(new THREE.Vector3(0, 0, 0));
    const animationDelay = useMemo(() => Math.random() * 2, []);

    const color = useMemo(() => {
        return CATEGORY_COLORS[category] || "#ffffff";
    }, [category]);

    // Handle animation
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        
        // Entrance lerp
        if (time > animationDelay) {
            currentPos.current.lerp(targetPos, 0.05);
            meshRef.current.position.copy(currentPos.current);
            if (haloRef.current) haloRef.current.position.copy(currentPos.current);
        }

        // Subtle breathing animation
        const s = 1 + Math.sin(time + id.length) * 0.1;
        meshRef.current.scale.set(s, s, s);

        // Halo pulse for completed dreams
        if (haloRef.current) {
            const hScale = (completed ? 1.5 : 0) + Math.sin(time * 2) * 0.2;
            haloRef.current.scale.set(hScale, hScale, hScale);
            haloRef.current.rotation.z += 0.01;
        }
    });

    return (
        <group>
            <mesh 
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(id);
                }}
                onPointerOver={() => {
                    setHovered(true);
                    onHover?.(true);
                }}
                onPointerOut={() => {
                    setHovered(false);
                    onHover?.(false);
                }}
            >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={hovered ? 10 : (completed ? 5 : 2)} 
                    toneMapped={false}
                />
            </mesh>

            {completed && (
                <mesh ref={haloRef}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.6} 
                        side={THREE.DoubleSide} 
                    />
                </mesh>
            )}
        </group>
    );
}
