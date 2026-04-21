'use client'

import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import GenerateModal from './GenerateModal'

export default function GenerateFlashcardButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-8 py-4 bg-red-600 text-white font-sans font-black uppercase tracking-widest text-xs border-[3px] border-newsprint-black shadow-brutalist-soft hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-3"
      >
        <Sparkles size={18} strokeWidth={3} /> TẠO BẰNG AI
      </button>
      
      <GenerateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
