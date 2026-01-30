'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Card } from './card';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay,
                type: "spring",
                stiffness: 100
            }}
            whileHover={{
                y: -5,
                transition: { duration: 0.2 }
            }}
            className="h-full"
        >
            <Card className={`h-full border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ${className}`}>
                {children}
            </Card>
        </motion.div>
    );
}
