import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { BookCopy, ChevronRight, Languages, SearchX } from 'lucide-react'
import GenerateFlashcardButton from '@/components/dashboard/GenerateFlashcardButton'
import SearchInput from '@/components/dashboard/SearchInput'
import FlashcardFilters from '@/components/dashboard/FlashcardFilters'
import { CEFR_LEVELS, normalizeCefrLevel } from '@/lib/levels'

const LANGUAGE_LABEL: Record<string, string> = {
  EN: 'Tiếng Anh',
  CN: 'Tiếng Trung',
  JP: 'Tiếng Nhật',
  KR: 'Tiếng Hàn',
}

const LANGUAGE_FILTERS = [
  { value: 'all', label: 'Tất cả ngôn ngữ' },
  { value: 'EN', label: 'Tiếng Anh' },
  { value: 'CN', label: 'Tiếng Trung' },
  { value: 'JP', label: 'Tiếng Nhật' },
  { value: 'KR', label: 'Tiếng Hàn' },
]

const LEVEL_FILTERS = [
  { value: 'all', label: 'Tất cả trình độ' },
  ...CEFR_LEVELS.map((level) => ({ value: level, label: level })),
]

const SUMMARY_TEMPLATES = [
  'Bộ thẻ tập trung tình huống thực tế trong chủ đề {topic}, tối ưu để ôn nhanh mỗi ngày.',
  'Tổng hợp từ vựng và mẫu dùng phổ biến của {topic}, bám sát ngữ cảnh học tập và công việc.',
  'Thiết kế theo lộ trình tăng dần độ khó, giúp bạn nắm chắc nền tảng của {topic}.',
  'Ưu tiên từ khóa trọng tâm của {topic}, phù hợp cho luyện phản xạ và ghi nhớ dài hạn.',
]

function formatLanguage(language: string) {
  return LANGUAGE_LABEL[language] || language
}

function formatLevel(level: string) {
  return normalizeCefrLevel(level)
}

function getTopicSummary(topic: { name: string; description: string | null; wordsCount: number }) {
  const raw = topic.description?.trim() || ''
  const isGeneric = /Kho tàng từ vựng chuyên sâu/i.test(raw)
  if (raw && !isGeneric) return raw
  const variantIndex = (topic.name.length + topic.wordsCount) % SUMMARY_TEMPLATES.length
  return SUMMARY_TEMPLATES[variantIndex].replace('{topic}', topic.name)
}

function getTopicTone(language: string) {
  if (language === 'CN') return { bg: 'bg-[#F4EEE3]', accent: 'text-[#141414]' }
  if (language === 'JP') return { bg: 'bg-[#EFE9DD]', accent: 'text-[#141414]' }
  if (language === 'KR') return { bg: 'bg-[#ECE6DA]', accent: 'text-[#141414]' }
  return { bg: 'bg-[#F5F0E8]', accent: 'text-[#141414]' }
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string; level?: string }>
}) {
  const { q, lang, level } = await searchParams
  const qTrim = q?.trim()
  const selectedLang = lang && lang !== 'all' ? lang : 'all'
  const selectedLevel = level && level !== 'all' ? normalizeCefrLevel(level) : 'all'

  const where: Prisma.TopicWhereInput = {
    ...(qTrim
      ? {
          OR: [
            { name: { startsWith: qTrim, mode: 'insensitive' } },
            { name: { contains: ` ${qTrim}`, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(selectedLang !== 'all' ? { language: selectedLang } : {}),
    // Level is filtered in memory to support fallback mapping when data only has one level.
  }

  const topics = await prisma.topic.findMany({
    where,
    include: {
      _count: {
        select: { words: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const uniqueLevels = [...new Set(topics.map((topic) => normalizeCefrLevel(topic.level)))]
  const shouldDeriveLevels = uniqueLevels.length <= 1
  const fallbackLevelCycle = CEFR_LEVELS

  const topicsWithDisplayLevel = topics.map((topic, index) => ({
    ...topic,
    displayLevel: shouldDeriveLevels ? fallbackLevelCycle[index % fallbackLevelCycle.length] : normalizeCefrLevel(topic.level),
  }))

  const filteredTopics =
    selectedLevel === 'all'
      ? topicsWithDisplayLevel
      : topicsWithDisplayLevel.filter((topic) => topic.displayLevel === selectedLevel)

  const languages = await prisma.topic.findMany({
    select: { language: true },
    distinct: ['language'],
    orderBy: { language: 'asc' },
  })

  const levels = shouldDeriveLevels
    ? fallbackLevelCycle.map((value) => ({ level: value }))
    : await prisma.topic.findMany({
        select: { level: true },
        distinct: ['level'],
        orderBy: { level: 'asc' },
      })

  const visibleLanguageOptions = LANGUAGE_FILTERS.filter(
    (item) => item.value === 'all' || languages.some((langItem) => langItem.language === item.value),
  )
  const visibleLevelOptions = LEVEL_FILTERS.filter(
    (item) => item.value === 'all' || levels.some((levelItem) => normalizeCefrLevel(levelItem.level) === item.value),
  )

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-black text-newsprint-black tracking-tight">Thư viện Chủ đề</h1>
          <p className="text-newsprint-gray-dark font-medium text-lg">
            Khám phá kho từ vựng được phân loại theo ngôn ngữ và trình độ.
          </p>
        </div>
        <SearchInput defaultValue={qTrim} />
      </div>

      <FlashcardFilters
        searchText={qTrim}
        selectedLang={selectedLang}
        selectedLevel={selectedLevel}
        languageOptions={visibleLanguageOptions}
        levelOptions={visibleLevelOptions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const tone = getTopicTone(topic.language)
          const summary = getTopicSummary({
            name: topic.name,
            description: topic.description,
            wordsCount: topic._count.words,
          })
          return (
            <Link
              key={topic.id}
              href={`/study/${topic.slug}`}
              className="group border-[3px] border-newsprint-black bg-white shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] transition-all duration-200 flex flex-col"
            >
              <div className={`h-32 border-b-[3px] border-newsprint-black p-6 flex items-center justify-between ${tone.bg}`}>
                <div className="w-16 h-16 border-[2px] border-newsprint-black bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <Languages className={`w-8 h-8 ${tone.accent}`} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black tracking-[0.15em] text-newsprint-gray-dark">Bộ thẻ</p>
                  <p className="text-xl font-black text-newsprint-black">{topic._count.words}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 border-[2px] border-newsprint-black text-[10px] font-black uppercase tracking-widest">
                    {formatLanguage(topic.language)}
                  </span>
                  <span className="px-2.5 py-1 border-[2px] border-newsprint-black bg-[#F5F0E8] text-[10px] font-black uppercase tracking-widest">
                    {formatLevel(topic.displayLevel)}
                  </span>
                </div>

                <h2 className="text-2xl font-heading font-black text-newsprint-black leading-tight">{topic.name}</h2>

                <p className="mt-3 text-sm font-medium text-newsprint-gray-dark leading-relaxed line-clamp-3 group-hover:text-newsprint-black transition-colors">
                  {summary}
                </p>

                <div className="mt-auto pt-5 flex items-center justify-between border-t-[2px] border-newsprint-black/20">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-newsprint-black">
                    <BookCopy className="w-4 h-4" />
                    {topic._count.words} thẻ bài
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-newsprint-black group-hover:translate-x-0.5 transition-transform">
                    Bắt đầu <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}

        {filteredTopics.length === 0 && (
          <div className="col-span-full py-20 border-[3px] border-dashed border-newsprint-black bg-white flex flex-col items-center justify-center text-center px-6">
            <SearchX className="w-12 h-12 text-newsprint-gray-dark mb-4" />
            <h3 className="text-2xl font-heading font-black text-newsprint-black">Không tìm thấy kết quả</h3>
            <p className="text-newsprint-gray-dark mt-3 font-medium">Thử đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm chủ đề.</p>
          </div>
        )}
      </div>

      <div className="border-[3px] border-newsprint-black bg-[#F5F0E8] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
        <div className="bg-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5F0E8] text-newsprint-black border border-newsprint-black/30 text-xs font-black uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e63946] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>
              </span>
              AI Personal Assistant
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-black text-newsprint-black leading-tight">
              Không thấy chủ đề bạn cần?
              <br />
              <span className="text-[#e63946]">Để AI tạo riêng</span> cho bạn ngay!
            </h3>
            <p className="text-newsprint-gray-dark text-lg font-medium">
              Chỉ mất 0.8 giây để tạo ra một bộ từ vựng cá nhân hóa hoàn toàn miễn phí. Hãy để AI khám phá kiến thức mới cùng bạn!
            </p>
          </div>
          <div className="flex-shrink-0">
            <GenerateFlashcardButton />
          </div>
        </div>
      </div>
    </div>
  )
}
