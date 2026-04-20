'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

function AnimatedNumber({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const numericPart = target.replace(/[^0-9.]/g, '')
          const targetNum = parseFloat(numericPart)
          const duration = 1500
          const steps = 40
          const increment = targetNum / steps
          let current = 0
          let step = 0

          const timer = setInterval(() => {
            step++
            current = Math.min(current + increment, targetNum)
            if (target.includes(',')) {
              setDisplay(Math.floor(current).toLocaleString())
            } else if (target.includes('.')) {
              setDisplay(current.toFixed(1))
            } else {
              setDisplay(Math.floor(current).toString())
            }
            if (step >= steps) {
              clearInterval(timer)
              setDisplay(target.replace(/[+★%]/g, ''))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, hasAnimated])

  return (
    <div ref={ref} className="stat-number">
      {display}{suffix}
    </div>
  )
}

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).lucide) {
      ; (window as any).lucide.createIcons()
    }
  }, [])

  return (
    <div className="bg-clay-cream text-clay-deep font-body">
      {/* Hero Section */}
      <section className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-0 relative overflow-hidden">
        {/* Floating Clay Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-clay-pink to-clay-pink/80 rounded-full shadow-clay-float animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-clay-green to-clay-green/80 rounded-full shadow-clay-float animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-20 w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-clay-orange to-clay-orange/80 rounded-full shadow-clay-float animate-float" style={{ animationDelay: '4s' }} />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Hero Text */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-warm-white/80 rounded-[40px] shadow-clay-card px-6 py-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-clay-blue to-clay-blue-dark rounded-[25px] shadow-clay-button flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-lg text-clay-deep">LinguaClay AI</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-tight">
                Kiến Tạo Kỹ Năng{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-clay-blue via-clay-green to-clay-pink">
                  Ngôn Ngữ Cùng AI
                </span>
              </h1>

              <p className="text-lg md:text-xl text-clay-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Học Tiếng Anh & Tiếng Trung thông minh với Flashcard AI, Chatbot thông minh và hàng nghìn bài tập cá nhân hóa
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login" className="relative group px-10 md:px-14 py-5 md:py-6 bg-gradient-to-br from-clay-brown to-clay-brown-dark text-white text-xl md:text-2xl font-bold rounded-[50px] shadow-clay-button hover:shadow-clay-button-hover active:scale-[0.95] transition-all duration-200 font-heading flex items-center justify-center gap-3">
                  <span className="absolute inset-0 rounded-[50px] animate-ping bg-clay-brown/20 group-hover:bg-clay-brown/30" style={{ animationDuration: '2s' }} />
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Bắt Đầu Học Miễn Phí
                </Link>
                <button className="px-10 md:px-12 py-5 bg-warm-white text-clay-muted text-xl font-bold rounded-[50px] shadow-clay-card hover:shadow-clay-button-hover active:scale-[0.95] transition-all duration-100 font-heading flex items-center justify-center gap-3 border-2 border-soft-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Xem Demo
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm text-clay-muted">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-clay-green/30 rounded-full flex items-center justify-center">
                    <span className="text-clay-green text-base font-bold">✓</span>
                  </div>
                  <span>Miễn phí 14 ngày</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-clay-green/30 rounded-full flex items-center justify-center">
                    <span className="text-clay-green text-base font-bold">✓</span>
                  </div>
                  <span>Không cần thẻ tín dụng</span>
                </div>
              </div>
            </div>

            <div className="relative h-[440px] md:h-[540px] flex items-center justify-center">
              <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-clay-blue/30 to-clay-green/30 rounded-full shadow-clay-float blur-xl" />
              <div className="relative w-[280px] md:w-[300px] h-[500px] md:h-[560px] bg-gradient-to-br from-warm-white to-cream rounded-[50px] shadow-clay-card p-3 transform rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-clay-deep/10 rounded-full z-10" />
                <div className="w-full h-full bg-gradient-to-br from-clay-cream to-warm-white rounded-[42px] flex flex-col overflow-hidden">
                  <div className="w-full px-4 md:px-5 pt-8 pb-3 bg-warm-white/90 backdrop-blur-sm border-b border-clay-shadow/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-clay-blue to-clay-green rounded-[16px] shadow-clay-button flex items-center justify-center">
                        <span className="text-sm">🏺</span>
                      </div>
                      <span className="text-sm font-heading font-bold text-clay-deep">LinguaClay</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <div className="bg-warm-white rounded-[18px] shadow-clay-button p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-heading font-bold text-clay-deep">📊 Tiến độ hôm nay</span>
                        <span className="text-xs text-clay-green font-bold font-body">75%</span>
                      </div>
                      <div className="h-2 bg-soft-gray rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-clay-green to-clay-blue rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>

                    <div className="relative h-36 md:h-40">
                      <div className="absolute inset-0 bg-white rounded-[22px] shadow-clay-button p-3 transform rotate-0 transition-transform duration-300 flex flex-col justify-center items-center">
                        <div className="text-3xl font-heading font-black text-clay-blue mb-1">你好</div>
                        <div className="text-sm text-clay-muted font-body">Nǐ hǎo • Xin chào</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 md:py-20 bg-warm-white border-y border-clay-shadow/30">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: '5,000', suffix: '+', label: 'Học Viên Đang Học', icon: '👥' },
              { num: '4.9', suffix: '★', label: 'Đánh Giá Trung Bình', icon: '⭐' },
              { num: '50,000', suffix: '+', label: 'Bài Tập Được Tạo', icon: '📚' },
              { num: '99', suffix: '%', label: 'Học Viên Tiến Bộ', icon: '📈' }
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-warm-white to-cream rounded-[32px] shadow-clay-card p-6 md:p-8 text-center hover:shadow-clay-button-hover transition-shadow duration-300">
                <div className="text-4xl md:text-5xl mb-3">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-clay-blue via-clay-green to-clay-pink mb-1">
                  <AnimatedNumber target={stat.num} suffix={stat.suffix} />
                </div>
                <div className="text-sm md:text-base text-clay-muted font-body font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 md:px-0 relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-clay-brown-dark via-clay-brown to-clay-deep" />
        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10 px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white leading-tight">
            Sẵn Sàng Bắt Đầu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-clay-gold via-clay-orange to-clay-pink">
              Hành Trình Ngôn Ngữ?
            </span>
          </h2>
          <div className="pt-2">
            <Link href="/login" className="inline-block px-10 md:px-16 py-5 md:py-6 bg-gradient-to-r from-clay-gold via-clay-orange to-clay-gold text-clay-brown-dark text-xl md:text-2xl font-black rounded-[50px] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 font-heading">
              Bắt Đầu Học Miễn Phí 14 Ngày
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
