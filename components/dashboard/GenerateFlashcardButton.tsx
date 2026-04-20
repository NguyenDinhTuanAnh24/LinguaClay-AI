'use client'

import React, { useState } from 'react'
import GenerateModal from './GenerateModal'

export default function GenerateFlashcardButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-clay-orange text-white font-heading font-black rounded-full shadow-clay-button hover:shadow-clay-button-hover active:scale-95 transition-all flex items-center gap-2"
      >
        <span>✨</span> Tạo bộ mới bằng AI
      </button>
      
      <GenerateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
