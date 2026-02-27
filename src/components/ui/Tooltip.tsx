"use client";

import { useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
    children: ReactNode;
    content: string;
    delay?: number;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export function Tooltip({
    children,
    content,
    delay = 300,
    position = "top",
    className = "",
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const variants = {
        hidden: { opacity: 0, scale: 0.95, y: position === "top" ? 5 : position === "bottom" ? -5 : 0, x: position === "left" ? 5 : position === "right" ? -5 : 0 },
        visible: { opacity: 1, scale: 1, y: 0, x: 0 },
    };

    const getPositionClasses = () => {
        switch (position) {
            case "top":
                return "bottom-full left-1/2 -translate-x-1/2 mb-2";
            case "bottom":
                return "top-full left-1/2 -translate-x-1/2 mt-2";
            case "left":
                return "right-full top-1/2 -translate-y-1/2 mr-2";
            case "right":
                return "left-full top-1/2 -translate-y-1/2 ml-2";
            default:
                return "bottom-full left-1/2 -translate-x-1/2 mb-2";
        }
    };

    return (
        <div
            className="relative flex items-center justify-center pointer-events-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={variants}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-50 px-2 py-1 text-[10px] font-medium text-white/90 whitespace-nowrap bg-black/80 backdrop-blur-md rounded border border-white/10 shadow-xl pointer-events-none ${getPositionClasses()} ${className}`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
