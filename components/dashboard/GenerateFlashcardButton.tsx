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
        className="px-8 py-4 bg-[#F5F0E8] text-newsprint-black font-sans font-black uppercase tracking-widest text-xs border-[3px] border-newsprint-black shadow-brutalist-soft hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all flex items-center gap-3"
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
