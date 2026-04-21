'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  width?: "fit-content" | "100%"
  delay?: number
  duration?: number
  yOffset?: number
  className?: string
}

export const ScrollReveal = ({ 
  children, 
  width = "100%", 
  delay = 0, 
  duration = 0.8,
  yOffset = 40,
  className = ""
}: ScrollRevealProps) => {
  return (
    <div className={className} style={{ position: 'relative', width, overflow: 'visible' }}>
      <motion.div
        className={className}
        variants={{
          hidden: { opacity: 0, y: yOffset },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration, 
          delay, 
          ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for smooth Brutalist feel
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
