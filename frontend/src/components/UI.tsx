import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  isLoading?: boolean
}

export const ButtonPrimary: React.FC<ButtonProps> = ({ children, onClick, className = '', isLoading = false }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className={`
        bg-transparent border border-white text-primary 
        font-mono uppercase tracking-button rounded-pill 
        px-8 py-3.5 h-[44px] transition-all relative overflow-hidden
        hover:bg-white hover:text-black
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

export const TextLink: React.FC<ButtonProps> = ({ children, onClick, className = '' }) => {
  return (
    <motion.a 
      whileHover={{ x: 5 }}
      href="#" 
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
      className={`text-link font-text underline transition-colors hover:text-primary inline-block ${className}`}
    >
      {children}
    </motion.a>
  )
}
