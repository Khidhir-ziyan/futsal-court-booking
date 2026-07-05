import React from 'react'
import { motion } from 'framer-motion'

export const FeatureSection: React.FC<{ title: string; items: { label: string; desc: string }[] }> = ({ title, items }) => (
  <section className="py-section px-6 max-w-[1280px] mx-auto">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="font-display text-2xl md:text-4xl uppercase tracking-display text-center mb-16"
    >
      {title}
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group relative p-8 border border-hairline hover:border-primary transition-colors"
        >
          <div className="font-display text-lg uppercase tracking-display mb-4 group-hover:text-link transition-colors">{item.label}</div>
          <div className="font-text text-body text-sm leading-relaxed">{item.desc}</div>
        </motion.div>
      ))}
    </div>
  </section>
)

export const StorySection: React.FC<{ image: string; text: string }> = ({ image, text }) => (
  <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
    <motion.div 
      initial={{ scale: 1.1 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 z-0"
    >
      <img src={image} alt="Luxury Futsal" className="w-full h-full object-cover opacity-40" />
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="relative z-10 text-center px-6"
    >
      <h2 className="font-display text-4xl md:text-6xl uppercase tracking-display leading-tight max-w-4xl mx-auto">
        {text}
      </h2>
    </motion.div>
  </section>
)
