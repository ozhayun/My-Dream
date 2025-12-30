"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { SpaceshipMesh } from "./SpaceshipMesh";

const MAX_GALAXY_RADIUS = 60; // Soft boundary starts at 50, hard at 60
const MOVE_SPEED = 20;
const LOOK_SENSITIVITY = 0.002;
const MOMENTUM_DAMPING = 0.95;

interface SpaceshipControlsProps {
    onJoystickState?: (left: { x: number, y: number, active: boolean }, right: { x: number, y: number, active: boolean }) => void;
    leftStickState?: { x: number, y: number, active: boolean };
    rightStickState?: { x: number, y: number, active: boolean };
}

export function SpaceshipControls({ leftStickState, rightStickState }: SpaceshipControlsProps) {
    const { camera, gl } = useThree();
    
    // Movement state
    const velocity = useRef(new THREE.Vector3());
    const keys = useRef<Record<string, boolean>>({});
    const mouseMovement = useRef({ x: 0, y: 0 });
    const rotation = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
        const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
        const handleMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement === gl.domElement) {
                mouseMovement.current.x -= e.movementX * LOOK_SENSITIVITY;
                mouseMovement.current.y -= e.movementY * LOOK_SENSITIVITY;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mousemove", handleMouseMove);

        const canvas = gl.domElement;
        const handleClick = () => {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        };
        canvas.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("click", handleClick);
        };
    }, [gl]);

    useFrame((_, delta) => {
        // 1. Handle Rotation (Mouse / Right Stick)
        let rotationX = mouseMovement.current.y;
        let rotationY = mouseMovement.current.x;

        // Add Right Stick rotation if active
        if (rightStickState?.active) {
            rotationY -= rightStickState.x * 0.05;
            rotationX += rightStickState.y * 0.03;
        }

        rotation.current.y += rotationY;
        rotation.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotation.current.x + rotationX));
        
        // Apply rotation to camera with slight damping for smoothness
        camera.quaternion.slerp(new THREE.Quaternion().setFromEuler(rotation.current), 0.2);
        
        // Reset mouse movement delta
        mouseMovement.current.x = 0;
        mouseMovement.current.y = 0;

        // 2. Handle Movement (WASD / Left Stick)
        const direction = new THREE.Vector3();
        if (keys.current["KeyW"] || keys.current["ArrowUp"]) direction.z -= 1;
        if (keys.current["KeyS"] || keys.current["ArrowDown"]) direction.z += 1;
        if (keys.current["KeyA"] || keys.current["ArrowLeft"]) direction.x -= 1;
        if (keys.current["KeyD"] || keys.current["ArrowRight"]) direction.x += 1;

        // Apply joystick movement if active
        if (leftStickState?.active) {
            direction.x += leftStickState.x;
            direction.z -= leftStickState.y;
        }

        if (direction.length() > 0) {
            direction.normalize();
            // Transform direction by camera rotation for proper directional movement
            direction.applyQuaternion(camera.quaternion);
        }

        // Calculate target velocity with increased speed
        const targetVelocity = direction.multiplyScalar(MOVE_SPEED * 1.2);
        
        // Ease into target velocity (Inertia)
        velocity.current.lerp(targetVelocity, 0.12);
        
        // Apply velocity to position
        camera.position.addScaledVector(velocity.current, delta);

        // 3. Boundary Logic (Stricter Wall)
        const dist = camera.position.length();
        if (dist > MAX_GALAXY_RADIUS - 15) {
            // Stronger push back
            const towardCenter = camera.position.clone().negate().normalize();
            const strength = (dist - (MAX_GALAXY_RADIUS - 15)) * 0.2;
            velocity.current.addScaledVector(towardCenter, strength);
        }
        
        // Absolute hard limit
        if (dist > MAX_GALAXY_RADIUS) {
            camera.position.setLength(MAX_GALAXY_RADIUS);
            velocity.current.multiplyScalar(0.5); // Dampen bounce
        }
    });

    return (
        <primitive object={camera}>
            <SpaceshipMesh />
        </primitive>
    );
}
