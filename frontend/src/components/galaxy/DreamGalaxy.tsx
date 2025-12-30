"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, PerspectiveCamera } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { DreamStar } from "./DreamStar";
import { SpaceshipControls } from "./SpaceshipControls";
import { useState, useEffect, Suspense } from "react";
import { api } from "@/services/api";
import { DreamEntry } from "@/types/dream";
import { DreamDetailsSidebar } from "./DreamDetailsSidebar";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GalaxyPoint {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    x: number;
    y: number;
    z: number;
}

export default function DreamGalaxy() {
    const [points, setPoints] = useState<GalaxyPoint[]>([]);
    const [allDreams, setAllDreams] = useState<DreamEntry[]>([]);
    const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
    const [hoveredDream, setHoveredDream] = useState<GalaxyPoint | null>(null);
    const [loading, setLoading] = useState(true);

    // Joystick State
    const [leftStick, setLeftStick] = useState({ x: 0, y: 0, active: false });
    const [rightStick, setRightStick] = useState({ x: 0, y: 0, active: false });
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const handleTouch = () => setIsTouch(true);
        window.addEventListener("touchstart", handleTouch, { once: true });
        
        const fetchData = async () => {
            try {
                const [pts, dreams] = await Promise.all([
                    api.galaxy.points(),
                    api.dreams.list()
                ]);
                setPoints(pts);
                setAllDreams(dreams);
            } catch (error) {
                console.error("Failed to load galaxy data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => window.removeEventListener("touchstart", handleTouch);
    }, []);

    const handleJoystick = (side: "left" | "right", e: React.TouchEvent) => {
        const touch = e.touches[0];
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = Math.max(-1, Math.min(1, (touch.clientX - centerX) / (rect.width / 2)));
        const y = Math.max(-1, Math.min(1, -(touch.clientY - centerY) / (rect.height / 2)));
        
        if (side === "left") setLeftStick({ x, y, active: true });
        else setRightStick({ x, y, active: true });
    };

    const stopJoystick = (side: "left" | "right") => {
        if (side === "left") setLeftStick({ x: 0, y: 0, active: false });
        else setRightStick({ x: 0, y: 0, active: false });
    };

    const handleStarClick = (id: string) => {
        const dream = allDreams.find(d => d.id === id);
        if (dream) setSelectedDream(dream);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-primary font-bold tracking-[0.2em] uppercase text-sm animate-pulse">Initializing Galaxy...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden select-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 30]} />
                <Suspense fallback={null}>
                    <color attach="background" args={["#000000"]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Stars radius={10} depth={20} count={500} factor={1} saturation={0} fade speed={2} /> {/* Space Dust */}
                    
                    {points.map((p) => (
                        <DreamStar 
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            category={p.category}
                            completed={p.completed}
                            position={[p.x, p.y, p.z]}
                            onClick={handleStarClick}
                            onHover={(isHovered: boolean) => setHoveredDream(isHovered ? p : null)}
                        />
                    ))}

                    <SpaceshipControls 
                        leftStickState={leftStick}
                        rightStickState={rightStick}
                    />

                    <EffectComposer>
                        <Bloom 
                            intensity={1.0} 
                            luminanceThreshold={0.2} 
                            luminanceSmoothing={0.9} 
                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>

            {/* Hover Modal (Quick View) */}
            <AnimatePresence>
                {hoveredDream && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[50]">
                        <div className="bg-background/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full mx-4 border-solid">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                    {hoveredDream.category}
                                </span>
                                {hoveredDream.completed && (
                                    <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                                        Goal Achieved
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-white leading-tight">
                                {hoveredDream.title}
                            </h2>
                            <div className="mt-6 flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-white/10" />
                                <span className="text-[8px] uppercase tracking-widest text-white/30">Targeting Reality</span>
                                <div className="h-[1px] flex-1 bg-white/10" />
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedDream && (
                    <DreamDetailsSidebar 
                        dream={selectedDream} 
                        onClose={() => setSelectedDream(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Persistent Mobile HUD */}
            {isTouch && (
                <div className="fixed inset-0 pointer-events-none z-[100] flex items-end justify-between p-10">
                    {/* Left Joystick */}
                    <div 
                        className="w-32 h-32 rounded-full border-2 border-white/10 bg-white/5 pointer-events-auto flex items-center justify-center relative active:scale-95 transition-transform"
                        onTouchMove={(e) => handleJoystick("left", e)}
                        onTouchEnd={() => stopJoystick("left")}
                    >
                        <div 
                            className="w-12 h-12 rounded-full bg-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                            style={{
                                transform: `translate(${leftStick.x * 20}px, ${-leftStick.y * 20}px)`
                            }}
                        />
                    </div>

                    {/* Right Joystick */}
                    <div 
                        className="w-32 h-32 rounded-full border-2 border-white/10 bg-white/5 pointer-events-auto flex items-center justify-center relative active:scale-95 transition-transform"
                        onTouchMove={(e) => handleJoystick("right", e)}
                        onTouchEnd={() => stopJoystick("right")}
                    >
                        <div 
                            className="w-12 h-12 rounded-full bg-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            style={{
                                transform: `translate(${rightStick.x * 20}px, ${-rightStick.y * 20}px)`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Simplified Desktop Instructions */}
            {!isTouch && (
                <div className="absolute bottom-6 left-6 pointer-events-none">
                    <div className="text-white/20 text-[9px] uppercase tracking-[0.2em] flex gap-4">
                        <span>WASD: Flight</span>
                        <span>Mouse: Look</span>
                        <span>Click: Star Scan</span>
                    </div>
                </div>
            )}
        </div>
    );
}
