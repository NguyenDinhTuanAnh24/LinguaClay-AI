'use client'

import { useEffect, useRef, useSyncExternalStore, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>>; resultIndex: number }) => void) | null
  onstart: (() => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition

type TutorMode = 'editor' | 'roleplay' | 'free-talk' | 'listening' | 'reading' | 'speaking'

type EditorNote = {
  wrong: string
  correct: string
  reasonVi: string
}

type EditorResult = {
  score: number
  feedbackVi: string
  strengthsVi: string[]
  improvementsVi: string[]
  revisedEssay: string
  detailedFeedbackVi: Array<{
    excerpt: string
    commentVi: string
    fixVi: string
  }>
  notes: EditorNote[]
}

type ChatTurn = {
  role: 'assistant' | 'user'
  content: string
}

type RoleplayResult = {
  reply: string
  reminderVi: string
  targetWords: string[]
  shouldWrapUp: boolean
  wrapUpEn?: string
  wrapUpVi?: string
  coachText?: string
}

type FreeTalkResult = {
  answerEn: string
  exampleEn: string
  explainVi: string
}

type ListeningQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
}

type ListeningBlank = {
  id: string
  prompt: string
  answer: string
}

type ListeningTest = {
  title: string
  introVi: string
  transcriptEn: string
  tipsVi: string[]
  questions: ListeningQuestion[]
  blanks: ListeningBlank[]
}

type ListeningGradeResult = {
  score: number
  correctCount: number
  totalQuestions: number
  levelEstimate: string
  feedbackVi: string
  wrongItems: Array<{
    questionId: string
    question: string
    userAnswer: string
    correctAnswer: string
    explanationVi: string
  }>
}

type ReadingQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
}

type ReadingBlank = {
  id: string
  prompt: string
  answer: string
}

type ReadingTest = {
  title: string
  introVi: string
  passageEn: string
  tipsVi: string[]
  questions: ReadingQuestion[]
  blanks: ReadingBlank[]
}

type ReadingGradeResult = {
  score: number
  correctCount: number
  totalQuestions: number
  levelEstimate: string
  feedbackVi: string
  wrongItems: Array<{
    questionId: string
    question: string
    userAnswer: string
    correctAnswer: string
    explanationVi: string
  }>
}

type SpeakingPrompt = {
  title: string
  introVi: string
  questions: string[]
}

type SpeakingGradeResult = {
  score: number
  levelEstimate: string
  feedbackVi: string
  criteria: {
    fluency: number
    vocabulary: number
    grammar: number
    pronunciation: number
  }
  improvements: Array<{
    question: string
    issueVi: string
    fixVi: string
    sampleAnswerEn: string
  }>
}

const MODE_ITEMS: Array<{ key: TutorMode; title: string; subtitle: string }> = [
  { key: 'listening', title: 'Listening', subtitle: 'Luyện nghe theo cấp độ' },
  { key: 'reading', title: 'Reading', subtitle: 'Luyện đọc theo cấp độ' },
  { key: 'editor', title: 'Writing', subtitle: 'Viết theo đề và chấm điểm' },
  { key: 'speaking', title: 'Speaking', subtitle: 'Luyện nói theo cấp độ' },
  { key: 'roleplay', title: 'Roleplay', subtitle: 'Nhập vai tình huống' },
  { key: 'free-talk', title: 'Free Talk & Q&A', subtitle: 'Hỏi đáp tự do' },
]

type GeneratedPrompt = {
  promptTitle: string
  promptEn: string
  tipsVi: string[]
}

const SCENARIOS = [
  {
    id: 'kids-class-intro',
    icon: '🧒',
    title: 'Giới thiệu bản thân trong lớp học',
    desc: 'AI đóng vai bạn cùng lớp, bạn tự giới thiệu và hỏi làm quen.',
  },
  {
    id: 'kids-playground',
    icon: '⚽',
    title: 'Rủ bạn chơi ở sân trường',
    desc: 'AI đóng vai bạn mới, bạn rủ chơi và thỏa thuận trò chơi.',
  },
  {
    id: 'kids-snack',
    icon: '🍪',
    title: 'Mua đồ ăn vặt sau giờ học',
    desc: 'AI đóng vai người bán, bạn hỏi giá, chọn món và thanh toán.',
  },
  {
    id: 'kids-teacher-help',
    icon: '📚',
    title: 'Xin cô giáo giúp bài tập',
    desc: 'AI đóng vai giáo viên, bạn hỏi phần chưa hiểu và xác nhận lại.',
  },
  {
    id: 'student-club',
    icon: '🎓',
    title: 'Đăng ký câu lạc bộ ở trường',
    desc: 'AI đóng vai trưởng nhóm CLB, bạn hỏi lịch sinh hoạt và cách tham gia.',
  },
  {
    id: 'travel-airport',
    icon: '✈️',
    title: 'Làm thủ tục ở sân bay',
    desc: 'AI đóng vai nhân viên quầy, bạn xác nhận vé, hành lý và cửa ra máy bay.',
  },
  {
    id: 'restaurant-order',
    icon: '🍽️',
    title: 'Gọi món ở nhà hàng',
    desc: 'AI đóng vai phục vụ, bạn gọi món, hỏi thành phần và yêu cầu thêm.',
  },
  {
    id: 'interview',
    icon: '💼',
    title: 'Phỏng vấn xin việc IT',
    desc: 'AI đóng vai HR, bạn trả lời về kỹ năng và kinh nghiệm.',
  },
  {
    id: 'market',
    icon: '🛒',
    title: 'Trả giá ở chợ đêm',
    desc: 'AI đóng vai người bán, bạn đàm phán giá và số lượng.',
  },
  {
    id: 'status-report',
    icon: '📊',
    title: 'Báo cáo tiến độ cho sếp',
    desc: 'AI đóng vai quản lý, bạn cập nhật tiến độ và blocker.',
  },
  {
    id: 'client-call',
    icon: '📞',
    title: 'Gọi điện cho khách hàng',
    desc: 'AI đóng vai khách hàng, bạn xác nhận yêu cầu và timeline.',
  },
  {
    id: 'doctor-appointment',
    icon: '🩺',
    title: 'Đặt lịch khám bệnh',
    desc: 'AI đóng vai lễ tân phòng khám, bạn mô tả triệu chứng và đặt lịch.',
  },
  {
    id: 'rent-house',
    icon: '🏠',
    title: 'Thương lượng thuê nhà',
    desc: 'AI đóng vai chủ nhà, bạn hỏi điều khoản hợp đồng và chi phí.',
  },
  {
    id: 'project-pitch',
    icon: '🧠',
    title: 'Thuyết trình ý tưởng dự án',
    desc: 'AI đóng vai nhà đầu tư, bạn trình bày giá trị và trả lời phản biện.',
  },
  {
    id: 'hotel-checkin',
    icon: '🏨',
    title: 'Làm thủ tục nhận phòng khách sạn',
    desc: 'AI đóng vai lễ tân, bạn xác nhận đặt phòng, thời gian ở và yêu cầu thêm.',
  },
  {
    id: 'team-conflict',
    icon: '🤝',
    title: 'Giải quyết mâu thuẫn trong nhóm',
    desc: 'AI đóng vai đồng nghiệp, bạn trao đổi để tháo gỡ xung đột và chốt hướng xử lý.',
  },
]

const ROLEPLAY_PAGE_SIZE = 4

const FREE_TALK_SUGGESTIONS = [
  'Khi nào dùng in, on, at?',
  'Phân biệt will và be going to như thế nào?',
  'Khi nào dùng since và for?',
  'Cách dùng make và do cho tự nhiên?',
]

const LISTENING_LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1']

type SessionHistoryItem = {
  id: string
  mode: TutorMode
  title: string
  createdAt: string
  payload: string
}

const HISTORY_STORAGE_KEY = 'aiTutorHistory'
const historyListeners = new Set<() => void>()
const EMPTY_HISTORY: SessionHistoryItem[] = []
let historyRawCache: string | null = null
let historyParsedCache: SessionHistoryItem[] = EMPTY_HISTORY

type HistoryPayload = {
  writingIdea?: string
  editorInput?: string
  generatedPrompt?: GeneratedPrompt | null
  editorResult?: EditorResult | null
  selectedScenario?: string
  roleplayTurns?: ChatTurn[]
  roleplayTargetWords?: string[]
  roleplayHint?: string
  roleplayWrapUpEn?: string
  roleplayWrapUp?: string
  qaInput?: string
  qaResult?: FreeTalkResult | null
  listeningLevel?: string
  listeningTopic?: string
  listeningTest?: ListeningTest | null
  listeningAnswers?: Record<string, number>
  listeningBlankAnswers?: Record<string, string>
  listeningResult?: ListeningGradeResult | null
  readingLevel?: string
  readingTopic?: string
  readingTest?: ReadingTest | null
  readingAnswers?: Record<string, number>
  readingBlankAnswers?: Record<string, string>
  readingResult?: ReadingGradeResult | null
  speakingLevel?: string
  speakingTopic?: string
  speakingPrompt?: SpeakingPrompt | null
  speakingAnswers?: string[]
  speakingCurrentIndex?: number
  speakingResult?: SpeakingGradeResult | null
}

function normalizeEditorResult(input: EditorResult | null | undefined): EditorResult | null {
  if (!input) return null
  return {
    score: typeof input.score === 'number' ? input.score : 0,
    feedbackVi: input.feedbackVi || '',
    strengthsVi: Array.isArray(input.strengthsVi) ? input.strengthsVi : [],
    improvementsVi: Array.isArray(input.improvementsVi) ? input.improvementsVi : [],
    revisedEssay: input.revisedEssay || '',
    detailedFeedbackVi: Array.isArray(input.detailedFeedbackVi) ? input.detailedFeedbackVi : [],
    notes: Array.isArray(input.notes) ? input.notes : [],
  }
}

function normalizeListeningTest(input: ListeningTest | null | undefined): ListeningTest | null {
  if (!input) return null
  return {
    title: input.title || '',
    introVi: input.introVi || '',
    transcriptEn: input.transcriptEn || '',
    tipsVi: Array.isArray(input.tipsVi) ? input.tipsVi : [],
    questions: Array.isArray(input.questions) ? input.questions : [],
    blanks: Array.isArray(input.blanks) ? input.blanks : [],
  }
}

function tokenizeForDiff(text: string) {
  return text.split(/(\s+)/).filter((token) => token.length > 0)
}

function buildLcsMatrix(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp
}

function renderHighlightedDiff(original: string, revised: string) {
  const sourceTokens = tokenizeForDiff(original)
  const revisedTokens = tokenizeForDiff(revised)
  const dp = buildLcsMatrix(sourceTokens, revisedTokens)

  const marked: Array<{ value: string; added: boolean }> = []
  let i = sourceTokens.length
  let j = revisedTokens.length

  while (i > 0 && j > 0) {
    if (sourceTokens[i - 1] === revisedTokens[j - 1]) {
      marked.push({ value: revisedTokens[j - 1], added: false })
      i--
      j--
    } else if (dp[i][j - 1] >= dp[i - 1][j]) {
      marked.push({ value: revisedTokens[j - 1], added: true })
      j--
    } else {
      i--
    }
  }

  while (j > 0) {
    marked.push({ value: revisedTokens[j - 1], added: true })
    j--
  }

  return marked.reverse().map((token, idx) =>
    token.added ? (
      <span
        key={`${token.value}-${idx}`}
        className="bg-green-100 text-green-800 font-semibold border-b border-green-500/60"
      >
        {token.value}
      </span>
    ) : (
      <span key={`${token.value}-${idx}`}>{token.value}</span>
    )
  )
}

function getHistoryClientSnapshot(): SessionHistoryItem[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (!raw) {
    historyRawCache = null
    historyParsedCache = EMPTY_HISTORY
    return historyParsedCache
  }
  if (raw === historyRawCache) {
    return historyParsedCache
  }
  try {
    const parsed = JSON.parse(raw) as SessionHistoryItem[]
    historyRawCache = raw
    historyParsedCache = Array.isArray(parsed) ? parsed.slice(0, 15) : EMPTY_HISTORY
    return historyParsedCache
  } catch {
    historyRawCache = raw
    historyParsedCache = EMPTY_HISTORY
    return historyParsedCache
  }
}

function subscribeHistory(listener: () => void) {
  historyListeners.add(listener)
  return () => historyListeners.delete(listener)
}

function emitHistoryChange() {
  historyListeners.forEach((listener) => listener())
}

function getHistoryServerSnapshot(): SessionHistoryItem[] {
  return EMPTY_HISTORY
}

export default function AITutorEditor() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [mode, setModeState] = useState<TutorMode>('editor')
  
  useEffect(() => {
    const qMode = searchParams?.get('mode')
    const validModes: TutorMode[] = ['editor', 'roleplay', 'free-talk', 'listening', 'reading', 'speaking']
    if (qMode && validModes.includes(qMode as TutorMode)) {
      setModeState(qMode as TutorMode)
      // Remove query param to clean up URL
      router.replace('/dashboard/ai-chat', { scroll: false })
    }
  }, [searchParams, router])

  const setMode = (nMode: TutorMode) => {
    setModeState(nMode)
  }
  const [selectedHistoryId, setSelectedHistoryId] = useState('')
  const historyItems = useSyncExternalStore(subscribeHistory, getHistoryClientSnapshot, getHistoryServerSnapshot)

  const [writingIdea, setWritingIdea] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null)
  const [editorInput, setEditorInput] = useState('')
  const [editorResult, setEditorResult] = useState<EditorResult | null>(null)
  const [promptLoading, setPromptLoading] = useState(false)
  const [editorLoading, setEditorLoading] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)

  const [selectedScenario, setSelectedScenario] = useState<string>(SCENARIOS[0].title)
  const [roleplayPage, setRoleplayPage] = useState(1)
  const [roleplayTurns, setRoleplayTurns] = useState<ChatTurn[]>([])
  const [roleplayInput, setRoleplayInput] = useState('')
  const [roleplayTargetWords, setRoleplayTargetWords] = useState<string[]>([])
  const [roleplayHint, setRoleplayHint] = useState('')
  const [roleplayWrapUpEn, setRoleplayWrapUpEn] = useState('')
  const [roleplayWrapUp, setRoleplayWrapUp] = useState('')
  const [roleplayCoachText, setRoleplayCoachText] = useState('')
  const [roleplayLoading, setRoleplayLoading] = useState(false)
  const [roleplayError, setRoleplayError] = useState<string | null>(null)

  const [qaInput, setQaInput] = useState('')
  const [qaResult, setQaResult] = useState<FreeTalkResult | null>(null)
  const [qaLoading, setQaLoading] = useState(false)
  const [qaError, setQaError] = useState<string | null>(null)

  const [listeningLevel, setListeningLevel] = useState('A2')
  const [listeningTopic, setListeningTopic] = useState('')
  const [listeningTest, setListeningTest] = useState<ListeningTest | null>(null)
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({})
  const [listeningBlankAnswers, setListeningBlankAnswers] = useState<Record<string, string>>({})
  const [listeningResult, setListeningResult] = useState<ListeningGradeResult | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [listeningAudioPlaying, setListeningAudioPlaying] = useState(false)
  const [listeningAudioFinished, setListeningAudioFinished] = useState(false)
  const [listeningLoading, setListeningLoading] = useState(false)
  const [listeningError, setListeningError] = useState<string | null>(null)
  const listeningSpeechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const [readingLevel, setReadingLevel] = useState('A2')
  const [readingTopic, setReadingTopic] = useState('')
  const [readingTest, setReadingTest] = useState<ReadingTest | null>(null)
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({})
  const [readingBlankAnswers, setReadingBlankAnswers] = useState<Record<string, string>>({})
  const [readingResult, setReadingResult] = useState<ReadingGradeResult | null>(null)
  const [readingLoading, setReadingLoading] = useState(false)
  const [readingError, setReadingError] = useState<string | null>(null)

  const [speakingLevel, setSpeakingLevel] = useState('A2')
  const [speakingTopic, setSpeakingTopic] = useState('')
  const [speakingPrompt, setSpeakingPrompt] = useState<SpeakingPrompt | null>(null)
  const [speakingAnswers, setSpeakingAnswers] = useState<string[]>([])
  const [speakingCurrentIndex, setSpeakingCurrentIndex] = useState(0)
  const [speakingResult, setSpeakingResult] = useState<SpeakingGradeResult | null>(null)
  const [speakingLoading, setSpeakingLoading] = useState(false)
  const [speakingError, setSpeakingError] = useState<string | null>(null)
  const [speakingRecording, setSpeakingRecording] = useState(false)
  const speakingRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  const totalRoleplayPages = Math.ceil(SCENARIOS.length / ROLEPLAY_PAGE_SIZE)
  const visibleScenarios = SCENARIOS.slice((roleplayPage - 1) * ROLEPLAY_PAGE_SIZE, roleplayPage * ROLEPLAY_PAGE_SIZE)
  const highlightedRevisedEssay = editorResult ? renderHighlightedDiff(editorInput, editorResult.revisedEssay) : null
  const moduleHistory = historyItems.filter((item) => item.mode === mode).slice(0, 10)

  const persistHistory = (next: SessionHistoryItem[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next.slice(0, 15)))
    emitHistoryChange()
  }

  const addHistory = (item: Omit<SessionHistoryItem, 'id' | 'createdAt'>) => {
    const nextItem: SessionHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    }
    const next = [nextItem, ...historyItems].slice(0, 15)
    persistHistory(next)
  }

  const handleLoadHistory = (id: string) => {
    setSelectedHistoryId(id)
    const item = historyItems.find((x) => x.id === id)
    if (!item) return
    try {
      const parsed = JSON.parse(item.payload) as HistoryPayload
      setMode(item.mode)
      if (item.mode === 'editor') {
        setWritingIdea(parsed.writingIdea || '')
        setEditorInput(parsed.editorInput || '')
        setGeneratedPrompt(parsed.generatedPrompt || null)
        setEditorResult(normalizeEditorResult(parsed.editorResult))
      }
      if (item.mode === 'roleplay') {
        setSelectedScenario(parsed.selectedScenario || SCENARIOS[0].title)
        setRoleplayTurns(parsed.roleplayTurns || [])
        setRoleplayTargetWords(parsed.roleplayTargetWords || [])
        setRoleplayHint(parsed.roleplayHint || '')
        setRoleplayWrapUpEn(parsed.roleplayWrapUpEn || '')
        setRoleplayWrapUp(parsed.roleplayWrapUp || '')
      }
      if (item.mode === 'free-talk') {
        setQaInput(parsed.qaInput || '')
        setQaResult(parsed.qaResult || null)
      }
      if (item.mode === 'listening') {
        setListeningLevel(parsed.listeningLevel || 'A2')
        setListeningTopic(parsed.listeningTopic || '')
        setListeningTest(normalizeListeningTest(parsed.listeningTest))
        setListeningAnswers(parsed.listeningAnswers || {})
        setListeningBlankAnswers(parsed.listeningBlankAnswers || {})
        setListeningResult(parsed.listeningResult || null)
      }
      if (item.mode === 'reading') {
        setReadingLevel(parsed.readingLevel || 'A2')
        setReadingTopic(parsed.readingTopic || '')
        setReadingTest(parsed.readingTest || null)
        setReadingAnswers(parsed.readingAnswers || {})
        setReadingBlankAnswers(parsed.readingBlankAnswers || {})
        setReadingResult(parsed.readingResult || null)
      }
      if (item.mode === 'speaking') {
        setSpeakingLevel(parsed.speakingLevel || 'A2')
        setSpeakingTopic(parsed.speakingTopic || '')
        setSpeakingPrompt(parsed.speakingPrompt || null)
        setSpeakingAnswers(parsed.speakingAnswers || [])
        setSpeakingCurrentIndex(parsed.speakingCurrentIndex || 0)
        setSpeakingResult(parsed.speakingResult || null)
      }
    } catch {
      // ignore parse error
    }
  }

  const getModeHistoryTitle = () => {
    if (mode === 'editor') return 'Lịch sử Writing'
    if (mode === 'roleplay') return 'Lịch sử Roleplay'
    if (mode === 'listening') return 'Lịch sử Listening'
    if (mode === 'reading') return 'Lịch sử Reading'
    if (mode === 'speaking') return 'Lịch sử Speaking'
    return 'Lịch sử Free Talk & Q&A'
  }

  const handleGeneratePrompt = async () => {
    if (!writingIdea.trim() || promptLoading) return
    setPromptLoading(true)
    setEditorError(null)
    setGeneratedPrompt(null)
    setEditorResult(null)
    try {
      const res = await fetch('/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePrompt',
          idea: writingIdea.trim(),
        }),
      })
      const data = (await res.json()) as { prompt?: GeneratedPrompt; error?: string }
      if (!res.ok || !data.prompt) throw new Error(data.error || 'Không thể tạo đề từ ý tưởng')
      setGeneratedPrompt(data.prompt)
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleEditorCheck = async () => {
    if (!editorInput.trim() || editorLoading || !generatedPrompt) return
    setEditorLoading(true)
    setEditorError(null)
    setEditorResult(null)
    try {
      const res = await fetch('/api/ai/tutor/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gradeEssay',
          content: editorInput,
          promptTitle: generatedPrompt.promptTitle,
        }),
      })
      const data = (await res.json()) as { result?: EditorResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể kiểm tra bài viết')
      setEditorResult(normalizeEditorResult(data.result))
      addHistory({
        mode: 'editor',
        title: 'Writing - Đã chấm bài',
        payload: JSON.stringify({
          writingIdea,
          editorInput,
          generatedPrompt,
          editorResult: data.result,
        }),
      })
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setEditorLoading(false)
    }
  }

  const handleStartNewWriting = () => {
    setSelectedHistoryId('')
    setWritingIdea('')
    setGeneratedPrompt(null)
    setEditorInput('')
    setEditorResult(null)
    setEditorError(null)
  }

  const handleStartRoleplay = async (scenarioTitle: string) => {
    if (roleplayLoading) return
    setRoleplayLoading(true)
    setRoleplayError(null)
    setRoleplayTurns([])
    setRoleplayHint('')
    setRoleplayWrapUpEn('')
    setRoleplayWrapUp('')
    setRoleplayCoachText('')
    try {
      const res = await fetch('/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'roleplay',
          scenarioTitle,
          start: true,
          turnCount: 0,
          history: [],
        }),
      })
      const data = (await res.json()) as { result?: RoleplayResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể bắt đầu roleplay')
      setRoleplayTargetWords(data.result.targetWords || [])
      setRoleplayHint(data.result.reminderVi || '')
      if (data.result.wrapUpEn) setRoleplayWrapUpEn(data.result.wrapUpEn)
      if (data.result.wrapUpVi) setRoleplayWrapUp(data.result.wrapUpVi)
      setRoleplayTurns([{ role: 'assistant', content: data.result.reply }])
    } catch (e) {
      setRoleplayError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setRoleplayLoading(false)
    }
  }

  const handleRoleplaySend = async () => {
    if (!roleplayInput.trim() || roleplayLoading) return
    const nextTurns: ChatTurn[] = [...roleplayTurns, { role: 'user', content: roleplayInput.trim() }]
    const userMessage = roleplayInput.trim()
    setRoleplayInput('')
    setRoleplayTurns(nextTurns)
    setRoleplayLoading(true)
    setRoleplayError(null)
    try {
      const res = await fetch('/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'roleplay',
          scenarioTitle: selectedScenario,
          message: userMessage,
          history: nextTurns,
          turnCount: nextTurns.filter((x) => x.role === 'user').length,
          targetWords: roleplayTargetWords,
        }),
      })
      const data = (await res.json()) as { result?: RoleplayResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể tiếp tục roleplay')
      const result = data.result
      setRoleplayTargetWords(result.targetWords || roleplayTargetWords)
      setRoleplayHint(result.reminderVi || '')
      if (result.wrapUpEn) setRoleplayWrapUpEn(result.wrapUpEn)
      if (result.wrapUpVi) setRoleplayWrapUp(result.wrapUpVi)
      setRoleplayTurns((prev) => [...prev, { role: 'assistant', content: result.reply }])
      addHistory({
        mode: 'roleplay',
        title: `Roleplay - ${selectedScenario}`,
        payload: JSON.stringify({
          selectedScenario,
          roleplayTurns: [...nextTurns, { role: 'assistant', content: result.reply }],
          roleplayTargetWords: result.targetWords || roleplayTargetWords,
          roleplayHint: result.reminderVi || '',
          roleplayWrapUpEn: result.wrapUpEn || roleplayWrapUpEn,
          roleplayWrapUp: result.wrapUpVi || roleplayWrapUp,
        }),
      })
    } catch (e) {
      setRoleplayError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setRoleplayLoading(false)
    }
  }

  const handleRoleplayCoach = async (action: 'hint' | 'explain') => {
    if (roleplayTurns.length === 0 || roleplayLoading) return
    setRoleplayLoading(true)
    setRoleplayError(null)
    setRoleplayCoachText('')
    try {
      const res = await fetch('/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'roleplay',
          scenarioTitle: selectedScenario,
          history: roleplayTurns,
          targetWords: roleplayTargetWords,
          roleplayAction: action,
        }),
      })
      const data = (await res.json()) as { result?: RoleplayResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể lấy coaching')
      setRoleplayCoachText(data.result.coachText || '')
    } catch (e) {
      setRoleplayError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setRoleplayLoading(false)
    }
  }

  const handleFreeTalkAsk = async () => {
    if (!qaInput.trim() || qaLoading) return
    setQaLoading(true)
    setQaError(null)
    setQaResult(null)
    try {
      const res = await fetch('/api/ai/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'freeTalk',
          message: qaInput.trim(),
        }),
      })
      const data = (await res.json()) as { result?: FreeTalkResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể trả lời câu hỏi')
      setQaResult(data.result)
      addHistory({
        mode: 'free-talk',
        title: 'Free Talk - Đã hỏi',
        payload: JSON.stringify({
          qaInput,
          qaResult: data.result,
        }),
      })
    } catch (e) {
      setQaError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setQaLoading(false)
    }
  }

  const handleStartNewQuestion = () => {
    setSelectedHistoryId('')
    setQaInput('')
    setQaResult(null)
    setQaError(null)
  }

  const handleStartNewListening = () => {
    setSelectedHistoryId('')
    setListeningTopic('')
    setListeningTest(null)
    setListeningAnswers({})
    setListeningBlankAnswers({})
    setListeningResult(null)
    setShowTranscript(false)
    setListeningAudioPlaying(false)
    setListeningAudioFinished(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setListeningError(null)
  }

  const handleGenerateListening = async () => {
    if (listeningLoading) return
    setListeningLoading(true)
    setListeningError(null)
    setListeningTest(null)
    setListeningAnswers({})
    setListeningBlankAnswers({})
    setListeningResult(null)
    setShowTranscript(false)
    setListeningAudioPlaying(false)
    setListeningAudioFinished(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    try {
      const res = await fetch('/api/ai/tutor/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateTest',
          levelTarget: listeningLevel,
          topicHint: listeningTopic.trim(),
        }),
      })
      const data = (await res.json()) as { test?: ListeningTest; error?: string }
      if (!res.ok || !data.test) throw new Error(data.error || 'Không thể tạo đề nghe')
      setListeningTest(data.test)
    } catch (e) {
      setListeningError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setListeningLoading(false)
    }
  }

  const handleSelectListeningAnswer = (questionId: string, optionIndex: number) => {
    setListeningAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleListeningBlankChange = (blankId: string, value: string) => {
    setListeningBlankAnswers((prev) => ({ ...prev, [blankId]: value }))
  }

  const handlePlayListeningAudio = () => {
    if (!listeningTest) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setListeningError('Trình duyệt hiện tại chưa hỗ trợ phát audio TTS.')
      return
    }
    setListeningError(null)
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(listeningTest.transcriptEn)
    utterance.lang = 'en-US'
    utterance.rate = listeningLevel === 'A1' ? 0.9 : listeningLevel === 'A2' ? 0.95 : 1
    utterance.onstart = () => {
      setListeningAudioPlaying(true)
      setListeningAudioFinished(false)
    }
    utterance.onend = () => {
      setListeningAudioPlaying(false)
      setListeningAudioFinished(true)
    }
    utterance.onerror = () => {
      setListeningAudioPlaying(false)
      setListeningError('Không thể phát audio. Bạn thử bấm phát lại.')
    }
    listeningSpeechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handleStopListeningAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setListeningAudioPlaying(false)
  }

  const handleGradeListening = async () => {
    if (!listeningTest || listeningLoading) return
    const mcqReady = Object.keys(listeningAnswers).length >= listeningTest.questions.length
    const blanksReady = listeningTest.blanks.every((b) => String(listeningBlankAnswers[b.id] || '').trim().length > 0)
    if (!mcqReady || !blanksReady) {
      setListeningError('Bạn cần hoàn thành cả trắc nghiệm và điền từ trước khi chấm.')
      return
    }
    setListeningLoading(true)
    setListeningError(null)
    setListeningResult(null)
    try {
      const res = await fetch('/api/ai/tutor/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gradeTest',
          levelTarget: listeningLevel,
          topicHint: listeningTopic.trim(),
          test: listeningTest,
          answers: listeningAnswers,
          blankAnswers: listeningBlankAnswers,
        }),
      })
      const data = (await res.json()) as { result?: ListeningGradeResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể chấm bài nghe')
      setListeningResult(data.result)
      addHistory({
        mode: 'listening',
        title: `Listening - ${listeningLevel}`,
        payload: JSON.stringify({
          listeningLevel,
          listeningTopic,
          listeningTest,
          listeningAnswers,
          listeningBlankAnswers,
          listeningResult: data.result,
        }),
      })
    } catch (e) {
      setListeningError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setListeningLoading(false)
    }
  }

  const handleStartNewReading = () => {
    setSelectedHistoryId('')
    setReadingTopic('')
    setReadingTest(null)
    setReadingAnswers({})
    setReadingBlankAnswers({})
    setReadingResult(null)
    setReadingError(null)
  }

  const handleGenerateReading = async () => {
    if (readingLoading) return
    setReadingLoading(true)
    setReadingError(null)
    setReadingTest(null)
    setReadingAnswers({})
    setReadingBlankAnswers({})
    setReadingResult(null)
    try {
      const res = await fetch('/api/ai/tutor/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateTest',
          levelTarget: readingLevel,
          topicHint: readingTopic.trim(),
        }),
      })
      const data = (await res.json()) as { test?: ReadingTest; error?: string }
      if (!res.ok || !data.test) throw new Error(data.error || 'Không thể tạo bài đọc')
      setReadingTest(data.test)
    } catch (e) {
      setReadingError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setReadingLoading(false)
    }
  }

  const handleSelectReadingAnswer = (questionId: string, optionIndex: number) => {
    setReadingAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleReadingBlankChange = (blankId: string, value: string) => {
    setReadingBlankAnswers((prev) => ({ ...prev, [blankId]: value }))
  }

  const handleGradeReading = async () => {
    if (!readingTest || readingLoading) return
    const mcqReady = Object.keys(readingAnswers).length >= readingTest.questions.length
    const blanksReady = readingTest.blanks.every((b) => String(readingBlankAnswers[b.id] || '').trim().length > 0)
    if (!mcqReady || !blanksReady) {
      setReadingError('Bạn cần hoàn thành tất cả câu hỏi và điền từ trước khi chấm.')
      return
    }
    setReadingLoading(true)
    setReadingError(null)
    setReadingResult(null)
    try {
      const res = await fetch('/api/ai/tutor/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gradeTest',
          levelTarget: readingLevel,
          topicHint: readingTopic.trim(),
          test: readingTest,
          answers: readingAnswers,
          blankAnswers: readingBlankAnswers,
        }),
      })
      const data = (await res.json()) as { result?: ReadingGradeResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể chấm bài đọc')
      setReadingResult(data.result)
      addHistory({
        mode: 'reading',
        title: `Reading - ${readingLevel}`,
        payload: JSON.stringify({
          readingLevel,
          readingTopic,
          readingTest,
          readingAnswers,
          readingBlankAnswers,
          readingResult: data.result,
        }),
      })
    } catch (e) {
      setReadingError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setReadingLoading(false)
    }
  }

  const handleStartNewSpeaking = () => {
    setSelectedHistoryId('')
    setSpeakingTopic('')
    setSpeakingPrompt(null)
    setSpeakingAnswers([])
    setSpeakingCurrentIndex(0)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (speakingRecognitionRef.current) {
      speakingRecognitionRef.current.stop()
      speakingRecognitionRef.current = null
    }
    setSpeakingRecording(false)
    setSpeakingResult(null)
    setSpeakingError(null)
  }

  const handleGenerateSpeaking = async () => {
    if (speakingLoading) return
    setSpeakingLoading(true)
    setSpeakingError(null)
    setSpeakingPrompt(null)
    setSpeakingAnswers([])
    setSpeakingCurrentIndex(0)
    setSpeakingResult(null)
    try {
      const res = await fetch('/api/ai/tutor/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePrompt',
          levelTarget: speakingLevel,
          topicHint: speakingTopic.trim(),
        }),
      })
      const data = (await res.json()) as { prompt?: SpeakingPrompt; error?: string }
      if (!res.ok || !data.prompt) throw new Error(data.error || 'Không thể tạo đề nói')
      setSpeakingPrompt(data.prompt)
      setSpeakingAnswers(Array.from({ length: data.prompt.questions.length }, () => ''))
      setSpeakingCurrentIndex(0)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const firstQuestion = data.prompt.questions[0]
        if (firstQuestion) {
          const utterance = new SpeechSynthesisUtterance(firstQuestion)
          utterance.lang = 'en-US'
          window.speechSynthesis.speak(utterance)
        }
      }
    } catch (e) {
      setSpeakingError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setSpeakingLoading(false)
    }
  }

  const handleSpeakingAnswerChange = (idx: number, value: string) => {
    setSpeakingAnswers((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleReadCurrentQuestion = () => {
    if (!speakingPrompt) return
    const question = speakingPrompt.questions[speakingCurrentIndex]
    if (!question || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(question)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const handleStartSpeakingRecord = () => {
    if (!speakingPrompt) return
    const Ctor = (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition ||
      (window as Window & { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
    if (!Ctor) {
      setSpeakingError('Trình duyệt chưa hỗ trợ nhận diện giọng nói.')
      return
    }
    if (speakingRecognitionRef.current) {
      speakingRecognitionRef.current.stop()
      speakingRecognitionRef.current = null
    }
    setSpeakingError(null)
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onstart = () => setSpeakingRecording(true)
    recognition.onend = () => setSpeakingRecording(false)
    recognition.onerror = () => {
      setSpeakingRecording(false)
      setSpeakingError('Không nhận diện được giọng nói. Bạn thử nói rõ hơn.')
    }
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript || ''
      }
      handleSpeakingAnswerChange(speakingCurrentIndex, transcript.trim())
    }
    speakingRecognitionRef.current = recognition
    recognition.start()
  }

  const handleStopSpeakingRecord = () => {
    if (speakingRecognitionRef.current) {
      speakingRecognitionRef.current.stop()
      speakingRecognitionRef.current = null
    }
    setSpeakingRecording(false)
  }

  const handleNextSpeakingQuestion = () => {
    if (!speakingPrompt) return
    const currentAnswer = (speakingAnswers[speakingCurrentIndex] || '').trim()
    if (!currentAnswer) {
      setSpeakingError('Bạn cần trả lời câu hiện tại trước khi sang câu tiếp.')
      return
    }
    const nextIndex = speakingCurrentIndex + 1
    if (nextIndex < speakingPrompt.questions.length) {
      setSpeakingCurrentIndex(nextIndex)
      setSpeakingError(null)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(speakingPrompt.questions[nextIndex])
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handleGradeSpeaking = async () => {
    if (!speakingPrompt || speakingLoading) return
    const allAnswered =
      speakingAnswers.length === speakingPrompt.questions.length &&
      speakingAnswers.every((x) => x.trim().length > 0)
    if (!allAnswered) {
      setSpeakingError('Bạn cần hoàn thành toàn bộ câu hỏi trước khi chấm.')
      return
    }

    setSpeakingLoading(true)
    setSpeakingError(null)
    setSpeakingResult(null)
    try {
      const res = await fetch('/api/ai/tutor/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gradeSpeaking',
          levelTarget: speakingLevel,
          topicHint: speakingTopic.trim(),
          prompt: speakingPrompt,
          answers: speakingAnswers,
        }),
      })
      const data = (await res.json()) as { result?: SpeakingGradeResult; error?: string }
      if (!res.ok || !data.result) throw new Error(data.error || 'Không thể chấm bài nói')
      setSpeakingResult(data.result)
      addHistory({
        mode: 'speaking',
        title: `Speaking - ${speakingLevel}`,
        payload: JSON.stringify({
          speakingLevel,
          speakingTopic,
          speakingPrompt,
          speakingAnswers,
          speakingCurrentIndex,
          speakingResult: data.result,
        }),
      })
    } catch (e) {
      setSpeakingError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra')
    } finally {
      setSpeakingLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (speakingRecognitionRef.current) {
        speakingRecognitionRef.current.stop()
        speakingRecognitionRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full space-y-8 pb-16">
      <section
        className="group transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,0.2)]"
        style={{
          background: '#EDE8DF',
          borderLeft: '4px solid #dc2626',
          borderTop: '1px solid #141414',
          borderRight: '1px solid #141414',
          borderBottom: '1px solid #141414',
          padding: '24px 36px',
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">AI Tutor</p>
        <h1 className="text-3xl md:text-4xl font-serif font-black text-[#141414] leading-tight vietnamese-text">AI Tutor</h1>
        <p className="mt-2 text-[13px] leading-7 text-[#4B4B4B] vietnamese-text">
          Chọn module phù hợp mục tiêu của bạn: luyện nghe, đọc, viết, nói, nhập vai và hỏi đáp tự do với AI.
        </p>
      </section>

      <section className="border-b border-[#141414]/20 pb-2">
        <div className="flex flex-wrap items-end gap-7">
          {MODE_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setMode(item.key)} className="space-y-1 text-left">
              <p className={`text-[12px] font-black uppercase tracking-[0.14em] ${mode === item.key ? 'text-[#141414]' : 'text-[#4B4B4B]'}`}>
                {item.title}
              </p>
              <p className="text-[11px] text-[#4B4B4B] font-semibold uppercase tracking-widest">{item.subtitle}</p>
              <div className={`h-0.5 ${mode === item.key ? 'bg-red-600' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#F5F0E8] border border-[#141414] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">{getModeHistoryTitle()}</p>
          <p className="text-[11px] font-semibold text-[#4B4B4B]">Hiển thị {moduleHistory.length} phiên gần nhất</p>
        </div>
        <div className="overflow-x-auto border border-[#141414] bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-[#EDE8DF] border-b border-[#141414]">
              <tr>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#141414]">Thời gian</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#141414]">Phiên</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#141414] w-37.5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {moduleHistory.length > 0 ? (
                moduleHistory.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#141414]/20 ${selectedHistoryId === item.id ? 'bg-[#fff7ed]' : 'bg-white'}`}
                  >
                    <td className="px-3 py-2 text-[12px] font-semibold text-[#4B4B4B]">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-3 py-2 text-[12px] font-semibold text-[#141414]">{item.title}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleLoadHistory(item.id)}
                        className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-[12px] font-medium text-[#4B4B4B] vietnamese-text">
                    Chưa có dữ liệu lịch sử cho module này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {mode === 'editor' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <section className="bg-[#F5F0E8] border border-[#141414] p-6 transition-all duration-300 hover:shadow-[10px_10px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Bài viết theo đề mẫu</p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4B4B4B]">{editorInput.length}/2500</p>
                <button
                  onClick={handleStartNewWriting}
                  className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
                >
                  Bắt đầu bản viết mới
                </button>
              </div>
            </div>
            <p className="text-[13px] text-[#4B4B4B] font-medium mb-2 vietnamese-text">
              Mô tả ý tưởng đề bài, để AI sinh đề, rồi viết bài tiếng Anh và chấm điểm.
            </p>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Ý tưởng đề bài</label>
            <textarea
              value={writingIdea}
              onChange={(e) => setWritingIdea(e.target.value)}
              className="mt-2 w-full min-h-21.5 bg-white border border-[#141414] p-3 text-[14px] leading-7 text-[#141414] focus:outline-none"
              placeholder="Ví dụ: Tôi muốn luyện viết email xin nghỉ phép lịch sự vì bận việc gia đình."
              maxLength={600}
            />
            <button
              onClick={handleGeneratePrompt}
              disabled={promptLoading || !writingIdea.trim()}
              className={`mt-3 w-full h-11 border text-[11px] font-black uppercase tracking-[0.12em] ${
                promptLoading || !writingIdea.trim()
                  ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                  : 'border-[#141414] bg-white text-[#141414] hover:bg-[#141414] hover:text-white'
              }`}
            >
              {promptLoading ? 'Đang tạo đề...' : 'Tạo đề bằng AI'}
            </button>
            <div className="border border-[#141414] bg-[#EDE8DF] px-3 py-2 mt-3 mb-3">
              {generatedPrompt ? (
                <div className="space-y-2">
                  <p className="text-[12px] font-semibold text-[#141414] vietnamese-text">Đề đã tạo: {generatedPrompt.promptTitle}</p>
                  <p className="text-[13px] text-[#141414]">{generatedPrompt.promptEn}</p>
                  {generatedPrompt.tipsVi.length > 0 ? (
                    <div>
                      {generatedPrompt.tipsVi.map((tip) => (
                        <p key={tip} className="text-[12px] text-[#4B4B4B] vietnamese-text">- {tip}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-[12px] text-[#4B4B4B] vietnamese-text">Chưa có đề. Hãy nhập ý tưởng và bấm &quot;Tạo đề bằng AI&quot;.</p>
              )}
            </div>
            <textarea
              value={editorInput}
              onChange={(e) => setEditorInput(e.target.value)}
              className="w-full min-h-80 md:min-h-95 bg-white border border-[#141414] p-4 text-[16px] leading-8 text-[#141414] focus:outline-none focus:ring-0"
              placeholder="Viết bài tiếng Anh của bạn theo đề AI vừa tạo..."
              maxLength={2500}
            />
            <button
              onClick={handleEditorCheck}
              disabled={editorLoading || !editorInput.trim() || !generatedPrompt}
              className={`mt-4 w-full h-12 border-2 text-[12px] font-black uppercase tracking-[0.14em] transition-all ${
                editorLoading || !editorInput.trim() || !generatedPrompt
                  ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                  : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600 hover:-translate-y-0.5'
              }`}
            >
              {editorLoading ? 'Đang chấm bài...' : 'Chấm bài'}
            </button>
            {editorError ? <p className="mt-3 text-[12px] font-bold text-red-700">{editorError}</p> : null}
            </section>

            <section className="bg-[#F5F0E8] border border-[#141414] p-6 min-h-55">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414] mb-3">Kết quả chấm bài</p>
              {editorResult ? (
                <div className="space-y-3">
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Điểm</p>
                    <p className="text-[28px] font-serif font-black text-[#141414]">{editorResult.score}/100</p>
                  </div>
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Nhận xét theo bài bạn viết</p>
                    <p className="text-[14px] leading-7 text-[#141414] vietnamese-text">{editorResult.feedbackVi}</p>
                  </div>
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Bản viết gợi ý cải thiện</p>
                    <p className="text-[14px] leading-7 text-[#141414]">{highlightedRevisedEssay}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] leading-7 text-[#4B4B4B] font-medium vietnamese-text">
                  Sau khi chấm, AI sẽ trả điểm, nhận xét và một bản viết gợi ý cải thiện.
                </p>
              )}
            </section>
          </div>

          <section className="bg-[#F5F0E8] border border-[#141414] p-6">
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#141414] mb-3">Phân tích lỗi & cải thiện</p>
            {editorResult ? (
              <div className="space-y-3">
                {editorResult.detailedFeedbackVi.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#4B4B4B]">
                      Nhận xét chi tiết theo từng đoạn bạn viết
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {editorResult.detailedFeedbackVi.map((item, idx) => (
                        <div key={`${item.excerpt}-${idx}`} className="bg-white border border-[#141414] p-3">
                          <p className="text-[13px] font-semibold text-[#141414] leading-6">
                            Trích đoạn: <span className="italic">&quot;{item.excerpt}&quot;</span>
                          </p>
                          <p className="text-[13px] text-[#4B4B4B] leading-6 vietnamese-text mt-1">
                            Nhận xét: {item.commentVi}
                          </p>
                          <p className="text-[13px] text-green-800 leading-6 vietnamese-text mt-1">
                            Gợi ý sửa: {item.fixVi}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Điểm mạnh</p>
                    {editorResult.strengthsVi.map((item) => (
                      <p key={item} className="text-[13px] text-[#141414] leading-6 vietnamese-text">- {item}</p>
                    ))}
                  </div>
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Điểm cần cải thiện</p>
                    {editorResult.improvementsVi.map((item) => (
                      <p key={item} className="text-[13px] text-[#141414] leading-6 vietnamese-text">- {item}</p>
                    ))}
                  </div>
                </div>
                {editorResult.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {editorResult.notes.map((note, idx) => (
                      <div key={`${note.wrong}-${idx}`} className="bg-white border border-[#141414] p-3">
                        <p className="text-[13px] font-black text-[#141414]">
                          <span className="line-through text-red-700">{note.wrong}</span> <span className="mx-1 text-[#4B4B4B]">→</span>
                          <span className="text-green-700">{note.correct}</span>
                        </p>
                        <p className="mt-1 text-[13px] text-[#4B4B4B] font-medium vietnamese-text">{note.reasonVi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#4B4B4B] font-semibold">Không phát hiện lỗi lớn.</p>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[#4B4B4B] font-semibold vietnamese-text">
                AI sẽ liệt kê điểm mạnh, điểm cần cải thiện và lỗi quan trọng cần sửa.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {mode === 'roleplay' ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">
                Danh sách tình huống ({SCENARIOS.length} chủ đề)
              </p>
              <p className="text-[11px] font-semibold text-[#4B4B4B]">
                Trang {roleplayPage}/{totalRoleplayPages}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {visibleScenarios.map((scenario) => {
              const active = selectedScenario === scenario.title
              return (
                <div
                  key={scenario.id}
                  className={`text-left border p-4 transition-all duration-300 ${
                    active
                      ? 'border-[#141414] bg-[#EDE8DF] shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] -translate-y-0.5'
                      : 'border-[#141414] bg-[#F5F0E8] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,0.1)]'
                  }`}
                >
                  <button
                    onClick={() => setSelectedScenario(scenario.title)}
                    className="w-full text-left"
                  >
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#141414]">
                      <span className="mr-1.5">{scenario.icon}</span>
                      {scenario.title}
                    </p>
                  </button>
                  <p className="text-[12px] text-[#4B4B4B] font-medium mt-2 vietnamese-text">{scenario.desc}</p>
                  <button
                    onClick={() => {
                      setSelectedScenario(scenario.title)
                      void handleStartRoleplay(scenario.title)
                    }}
                    className="mt-3 h-9 w-full border border-[#141414] bg-[#141414] text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-red-600 hover:border-red-600"
                  >
                    Bắt đầu
                  </button>
                </div>
              )
              })}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRoleplayPage((p) => Math.max(1, p - 1))}
                disabled={roleplayPage === 1}
                className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
              >
                Trang trước
              </button>
              <button
                onClick={() => setRoleplayPage((p) => Math.min(totalRoleplayPages, p + 1))}
                disabled={roleplayPage === totalRoleplayPages}
                className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
              >
                Trang sau
              </button>
            </div>
          </section>

          <section className="bg-[#F5F0E8] border border-[#141414] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Roleplay: {selectedScenario}</p>
              {roleplayTurns.length > 0 ? (
                <button
                  onClick={() => void handleStartRoleplay(selectedScenario)}
                  className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-[#141414] hover:text-white"
                >
                  Bắt đầu lại
                </button>
              ) : null}
            </div>

            {roleplayTargetWords.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {roleplayTargetWords.map((word) => (
                  <span key={word} className="px-3 py-1 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-[0.08em] text-[#141414]">
                    {word}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="bg-white border border-[#141414] p-4 min-h-70 max-h-105 overflow-y-auto space-y-3">
              {roleplayTurns.length === 0 ? (
                <p className="text-[13px] text-[#4B4B4B] font-medium vietnamese-text">
                  Chọn một thẻ bối cảnh để AI mở đầu hội thoại.
                </p>
              ) : (
                roleplayTurns.map((turn, idx) => (
                  <div
                    key={`${turn.role}-${idx}`}
                    className={`p-3 border ${turn.role === 'assistant' ? 'border-[#141414] bg-[#F5F0E8]' : 'border-red-600 bg-[#fff5f5]'}`}
                  >
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">{turn.role === 'assistant' ? 'AI' : 'You'}</p>
                    <p className="text-[15px] text-[#141414] leading-7">{turn.content}</p>
                  </div>
                ))
              )}
            </div>

            {roleplayHint ? <p className="mt-3 text-[12px] font-semibold text-[#4B4B4B] vietnamese-text">{roleplayHint}</p> : null}
            {roleplayWrapUpEn ? <p className="mt-2 text-[13px] font-semibold text-[#141414] border border-[#141414] bg-white p-3">{roleplayWrapUpEn}</p> : null}
            {roleplayWrapUp ? <p className="mt-2 text-[12px] font-semibold text-[#141414] vietnamese-text border border-[#141414] bg-white p-3">{roleplayWrapUp}</p> : null}
            {roleplayError ? <p className="mt-2 text-[12px] font-bold text-red-700">{roleplayError}</p> : null}
            {roleplayCoachText ? (
              <p className="mt-2 text-[12px] font-medium text-[#141414] vietnamese-text border border-red-600 bg-[#fff5f5] p-3">
                {roleplayCoachText}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => void handleRoleplayCoach('hint')}
                disabled={roleplayTurns.length === 0 || roleplayLoading}
                className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
              >
                Xem gợi ý câu trả lời
              </button>
              <button
                onClick={() => void handleRoleplayCoach('explain')}
                disabled={roleplayTurns.length === 0 || roleplayLoading}
                className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
              >
                Nhờ AI giải thích lỗi
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <input
                value={roleplayInput}
                onChange={(e) => setRoleplayInput(e.target.value)}
                placeholder="Trả lời để duy trì hội thoại..."
                className="flex-1 h-11 border border-[#141414] bg-white px-3 text-[15px] focus:outline-none"
              />
              <button
                onClick={handleRoleplaySend}
                disabled={roleplayLoading || !roleplayInput.trim()}
                className={`h-11 px-5 border text-[11px] font-black uppercase tracking-[0.12em] ${
                  roleplayLoading || !roleplayInput.trim()
                    ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                    : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                }`}
              >
                {roleplayLoading ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {mode === 'free-talk' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-7 bg-[#F5F0E8] border border-[#141414] p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Câu hỏi của bạn</p>
              <button
                onClick={handleStartNewQuestion}
                className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
              >
                Câu hỏi mới
              </button>
            </div>
            <textarea
              value={qaInput}
              onChange={(e) => setQaInput(e.target.value)}
              className="w-full min-h-55 bg-white border border-[#141414] p-4 text-[16px] leading-8 text-[#141414] focus:outline-none"
              placeholder="Ví dụ: Khi nào dùng in, on, at?"
              maxLength={1500}
            />
            <button
              onClick={handleFreeTalkAsk}
              disabled={qaLoading || !qaInput.trim()}
              className={`mt-4 w-full h-12 border-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                qaLoading || !qaInput.trim()
                  ? 'border-[#141414] bg-[#141414] text-white opacity-45 cursor-not-allowed'
                  : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
              }`}
            >
              {qaLoading ? 'Đang trả lời...' : 'Hỏi AI'}
            </button>
            {qaError ? <p className="mt-3 text-[12px] font-bold text-red-700">{qaError}</p> : null}
          </section>

          <section className="xl:col-span-5 bg-[#F5F0E8] border border-[#141414] p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414] mb-3">Câu trả lời sẽ hiện ở đây</p>
            {qaResult ? (
              <div className="space-y-3">
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Trả lời (EN)</p>
                  <p className="text-[15px] text-[#141414] leading-7">{qaResult.answerEn}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Ví dụ (EN)</p>
                  <p className="text-[15px] text-[#141414] leading-7">{qaResult.exampleEn}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Giải thích nhanh (VI)</p>
                  <p className="text-[14px] text-[#141414] leading-7 vietnamese-text">{qaResult.explainVi}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] text-[#4B4B4B] font-medium vietnamese-text">
                  AI sẽ trả lời chính bằng tiếng Anh, kèm một giải thích nhanh bằng tiếng Việt.
                </p>
                <div className="pt-2 space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Gợi ý câu hỏi</p>
                  {FREE_TALK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQaInput(suggestion)}
                      className="block w-full text-left text-[13px] text-[#4B4B4B] border border-transparent hover:border-[#141414]/20 hover:bg-white px-2 py-1 transition-colors"
                    >
                      - {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {mode === 'reading' ? (
        <div className="space-y-6">
          <section className="bg-[#F5F0E8] border border-[#141414] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Thiết lập bài đọc</p>
              <button
                onClick={handleStartNewReading}
                className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
              >
                Bài đọc mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Cấp độ mục tiêu</label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] font-semibold text-[#141414] focus:outline-none"
                >
                  {LISTENING_LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Chủ đề đọc (tuỳ chọn)</label>
                <input
                  value={readingTopic}
                  onChange={(e) => setReadingTopic(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] text-[#141414] focus:outline-none"
                  placeholder="Ví dụ: school life, travel, technology..."
                  maxLength={120}
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={handleGenerateReading}
                  disabled={readingLoading}
                  className={`h-11 w-full border text-[11px] font-black uppercase tracking-[0.12em] ${
                    readingLoading
                      ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                      : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                >
                  {readingLoading ? 'Đang tạo...' : 'Tạo bài đọc'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-[#4B4B4B] vietnamese-text">
              Mỗi bài gồm 1 đoạn đọc + 5 câu hỏi trắc nghiệm theo cấp độ bạn chọn.
            </p>
            {readingError ? <p className="mt-2 text-[12px] font-bold text-red-700">{readingError}</p> : null}
          </section>

          {readingTest ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <section className="xl:col-span-5 bg-[#F5F0E8] border border-[#141414] p-6 space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">{readingTest.title}</p>
                <p className="text-[13px] text-[#4B4B4B] vietnamese-text">{readingTest.introVi}</p>
                {readingTest.tipsVi.length > 0 ? (
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Mẹo nhanh</p>
                    {readingTest.tipsVi.map((tip) => (
                      <p key={tip} className="text-[12px] text-[#141414] leading-6 vietnamese-text">- {tip}</p>
                    ))}
                  </div>
                ) : null}
                <div className="bg-white border border-[#141414] p-4 max-h-120 overflow-y-auto">
                  <p className="text-[14px] leading-7 text-[#141414]">{readingTest.passageEn}</p>
                </div>
              </section>

              <section className="xl:col-span-7 bg-[#F5F0E8] border border-[#141414] p-6 space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Câu hỏi đọc hiểu</p>
                {readingTest.questions.map((q, qIndex) => (
                  <div key={q.id} className="bg-white border border-[#141414] p-4">
                    <p className="text-[14px] font-semibold text-[#141414] leading-7">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="mt-2 space-y-2">
                      {q.options.map((option, optionIndex) => {
                        const checked = readingAnswers[q.id] === optionIndex
                        return (
                          <label
                            key={`${q.id}-${optionIndex}`}
                            className={`flex items-start gap-2 border p-2 cursor-pointer ${
                              checked ? 'border-red-600 bg-[#fff5f5]' : 'border-[#141414]/20 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={checked}
                              onChange={() => handleSelectReadingAnswer(q.id, optionIndex)}
                              className="mt-1"
                            />
                            <span className="text-[13px] text-[#141414] leading-6">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {readingTest.blanks.length > 0 ? (
                  <div className="bg-white border border-[#141414] p-4 space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Điền từ vào chỗ trống</p>
                    {readingTest.blanks.map((blank, idx) => (
                      <div key={blank.id} className="space-y-1">
                        <p className="text-[13px] text-[#141414]">
                          {idx + 1}. {blank.prompt.replace('____', '_____')}
                        </p>
                        <input
                          value={readingBlankAnswers[blank.id] || ''}
                          onChange={(e) => handleReadingBlankChange(blank.id, e.target.value)}
                          className="h-10 w-full border border-[#141414]/30 bg-[#F9FAFB] px-3 text-[14px] text-[#141414] focus:outline-none"
                          placeholder="Điền từ bạn tìm được..."
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  onClick={handleGradeReading}
                  disabled={readingLoading}
                  className={`w-full h-12 border-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                    readingLoading
                      ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                      : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                >
                  {readingLoading ? 'Đang chấm...' : 'Chấm bài đọc'}
                </button>
              </section>
            </div>
          ) : null}

          {readingResult ? (
            <section className="bg-[#F5F0E8] border border-[#141414] p-6 space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Kết quả reading</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Điểm</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">
                    {readingResult.correctCount}/{readingResult.totalQuestions}
                  </p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Tỷ lệ đúng</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">{readingResult.score}%</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Cấp độ ước lượng</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">{readingResult.levelEstimate}</p>
                </div>
              </div>
              <div className="bg-white border border-[#141414] p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Nhận xét AI</p>
                <p className="text-[13px] text-[#141414] leading-7 vietnamese-text whitespace-pre-line">{readingResult.feedbackVi}</p>
              </div>
              {readingResult.wrongItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {readingResult.wrongItems.map((item) => (
                    <div key={item.questionId} className="bg-white border border-[#141414] p-3">
                      <p className="text-[13px] font-semibold text-[#141414] leading-6">{item.question}</p>
                      <p className="mt-1 text-[12px] text-red-700 font-semibold">Bạn chọn: {item.userAnswer}</p>
                      <p className="text-[12px] text-green-700 font-semibold">Đáp án đúng: {item.correctAnswer}</p>
                      <p className="mt-1 text-[12px] text-[#4B4B4B] vietnamese-text leading-6">{item.explanationVi}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-green-700 font-semibold">Excellent. Bạn làm đúng toàn bộ câu hỏi.</p>
              )}
            </section>
          ) : null}
        </div>
      ) : null}

      {mode === 'speaking' ? (
        <div className="space-y-6">
          <section className="bg-[#F5F0E8] border border-[#141414] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Thiết lập bài nói</p>
              <button
                onClick={handleStartNewSpeaking}
                className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
              >
                Bài nói mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Cấp độ mục tiêu</label>
                <select
                  value={speakingLevel}
                  onChange={(e) => setSpeakingLevel(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] font-semibold text-[#141414] focus:outline-none"
                >
                  {LISTENING_LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Chủ đề nói (tuỳ chọn)</label>
                <input
                  value={speakingTopic}
                  onChange={(e) => setSpeakingTopic(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] text-[#141414] focus:outline-none"
                  placeholder="Ví dụ: daily routine, study plan, hometown..."
                  maxLength={120}
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={handleGenerateSpeaking}
                  disabled={speakingLoading}
                  className={`h-11 w-full border text-[11px] font-black uppercase tracking-[0.12em] ${
                    speakingLoading
                      ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                      : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                >
                  {speakingLoading ? 'Đang tạo...' : 'Tạo đề nói'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-[#4B4B4B] vietnamese-text">
              AI sẽ hỏi nhiều câu liên tiếp. Bạn trả lời bằng mic và chỉ chấm sau khi hoàn thành toàn bộ phiên.
            </p>
            {speakingError ? <p className="mt-2 text-[12px] font-bold text-red-700">{speakingError}</p> : null}
          </section>

          {speakingPrompt ? (
            <section className="bg-[#F5F0E8] border border-[#141414] p-6 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">{speakingPrompt.title}</p>
              <p className="text-[13px] text-[#4B4B4B] vietnamese-text">{speakingPrompt.introVi}</p>
              <div className="bg-white border border-[#141414] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#141414]">
                    Câu hỏi {Math.min(speakingCurrentIndex + 1, speakingPrompt.questions.length)}/{speakingPrompt.questions.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleReadCurrentQuestion}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
                    >
                      AI đọc câu hỏi
                    </button>
                    <button
                      onClick={handleStartSpeakingRecord}
                      disabled={speakingRecording}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                    >
                      Bật mic
                    </button>
                    <button
                      onClick={handleStopSpeakingRecord}
                      disabled={!speakingRecording}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                    >
                      Tắt mic
                    </button>
                  </div>
                </div>
                <p className="text-[14px] font-semibold text-[#141414] leading-7">
                  {speakingPrompt.questions[speakingCurrentIndex]}
                </p>
                <textarea
                  value={speakingAnswers[speakingCurrentIndex] || ''}
                  onChange={(e) => handleSpeakingAnswerChange(speakingCurrentIndex, e.target.value)}
                  className="w-full min-h-28 bg-[#F9FAFB] border border-[#141414]/30 p-3 text-[14px] leading-7 text-[#141414] focus:outline-none"
                  placeholder="Your spoken answer will appear here (English)..."
                  maxLength={900}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleNextSpeakingQuestion}
                    disabled={speakingCurrentIndex >= speakingPrompt.questions.length - 1}
                    className="h-9 px-4 border border-[#141414] bg-white text-[11px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                  >
                    Câu tiếp
                  </button>
                </div>
              </div>

              <button
                onClick={handleGradeSpeaking}
                disabled={speakingLoading}
                className={`w-full h-12 border-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                  speakingLoading
                    ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                    : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                }`}
              >
                {speakingLoading ? 'Đang chấm...' : 'Chấm bài nói'}
              </button>
            </section>
          ) : null}

          {speakingResult ? (
            <section className="bg-[#F5F0E8] border border-[#141414] p-6 space-y-3 max-h-140 overflow-y-auto">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Kết quả speaking</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Điểm tổng</p>
                  <p className="text-[24px] font-serif font-black text-[#141414]">{speakingResult.score}/100</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Cấp độ</p>
                  <p className="text-[24px] font-serif font-black text-[#141414]">{speakingResult.levelEstimate}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Fluency</p>
                  <p className="text-[22px] font-serif font-black text-[#141414]">{speakingResult.criteria.fluency}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Vocabulary</p>
                  <p className="text-[22px] font-serif font-black text-[#141414]">{speakingResult.criteria.vocabulary}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Grammar</p>
                  <p className="text-[22px] font-serif font-black text-[#141414]">{speakingResult.criteria.grammar}</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Pronunciation</p>
                  <p className="text-[22px] font-serif font-black text-[#141414]">{speakingResult.criteria.pronunciation}</p>
                </div>
              </div>
              <div className="bg-white border border-[#141414] p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Nhận xét AI</p>
                <p className="text-[13px] text-[#141414] leading-7 vietnamese-text whitespace-pre-line">{speakingResult.feedbackVi}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {speakingResult.improvements.map((item, idx) => (
                  <div key={`${item.question}-${idx}`} className="bg-white border border-[#141414] p-3">
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#141414] mb-1">{item.question}</p>
                    <p className="text-[12px] text-[#4B4B4B] vietnamese-text"><span className="font-semibold">Lỗi:</span> {item.issueVi}</p>
                    <p className="text-[12px] text-[#4B4B4B] vietnamese-text mt-1"><span className="font-semibold">Khắc phục:</span> {item.fixVi}</p>
                    <p className="text-[12px] text-[#141414] mt-1"><span className="font-semibold">Mẫu EN:</span> {item.sampleAnswerEn}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {mode === 'listening' ? (
        <div className="space-y-6">
          <section className="bg-[#F5F0E8] border border-[#141414] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Thiết lập bài nghe</p>
              <button
                onClick={handleStartNewListening}
                className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
              >
                Bài nghe mới
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Cấp độ mục tiêu</label>
                <select
                  value={listeningLevel}
                  onChange={(e) => setListeningLevel(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] font-semibold text-[#141414] focus:outline-none"
                >
                  {LISTENING_LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Chủ đề nghe (tuỳ chọn)</label>
                <input
                  value={listeningTopic}
                  onChange={(e) => setListeningTopic(e.target.value)}
                  className="mt-1 h-11 w-full border border-[#141414] bg-white px-3 text-[14px] text-[#141414] focus:outline-none"
                  placeholder="Ví dụ: campus tour, office meeting, travel plan..."
                  maxLength={120}
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={handleGenerateListening}
                  disabled={listeningLoading}
                  className={`h-11 w-full border text-[11px] font-black uppercase tracking-[0.12em] ${
                    listeningLoading
                      ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                      : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                >
                  {listeningLoading ? 'Đang tạo...' : 'Tạo bài nghe'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-[#4B4B4B] vietnamese-text">
              Mỗi bài gồm audio, câu trắc nghiệm và phần điền từ vào chỗ trống theo cấp độ bạn chọn.
            </p>
            {listeningError ? <p className="mt-2 text-[12px] font-bold text-red-700">{listeningError}</p> : null}
          </section>

          {listeningTest ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <section className="xl:col-span-5 bg-[#F5F0E8] border border-[#141414] p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">{listeningTest.title}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayListeningAudio}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white"
                    >
                      {listeningAudioPlaying ? 'Đang phát...' : 'Phát audio'}
                    </button>
                    <button
                      onClick={handleStopListeningAudio}
                      disabled={!listeningAudioPlaying}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                    >
                      Dừng
                    </button>
                    <button
                      onClick={() => setShowTranscript((prev) => !prev)}
                      disabled={!listeningResult}
                      className="h-8 px-3 border border-[#141414] bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#141414] hover:text-white"
                    >
                      {showTranscript ? 'Ẩn transcript' : 'Hiện transcript'}
                    </button>
                  </div>
                </div>
                <p className="text-[13px] text-[#4B4B4B] vietnamese-text">{listeningTest.introVi}</p>
                <p className="text-[12px] text-[#4B4B4B] vietnamese-text">
                  {listeningAudioFinished
                    ? 'Audio đã phát xong. Bạn có thể phát lại nếu muốn nghe lần nữa.'
                    : 'Hãy bấm "Phát audio" để nghe trước khi trả lời câu hỏi.'}
                </p>
                {listeningTest.tipsVi.length > 0 ? (
                  <div className="bg-white border border-[#141414] p-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Mẹo nhanh</p>
                    {listeningTest.tipsVi.map((tip) => (
                      <p key={tip} className="text-[12px] text-[#141414] leading-6 vietnamese-text">- {tip}</p>
                    ))}
                  </div>
                ) : null}
                {showTranscript ? (
                  <div className="bg-white border border-[#141414] p-4 max-h-95 overflow-y-auto">
                    <p className="text-[14px] leading-7 text-[#141414]">{listeningTest.transcriptEn}</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#141414] p-4">
                    <p className="text-[12px] text-[#4B4B4B] font-semibold vietnamese-text">
                      Transcript sẽ mở sau khi bạn chấm bài xong.
                    </p>
                  </div>
                )}
              </section>

              <section className="xl:col-span-7 bg-[#F5F0E8] border border-[#141414] p-6 space-y-4 max-h-190 overflow-y-auto">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Câu hỏi nghe</p>
                {listeningTest.questions.map((q, qIndex) => (
                  <div key={q.id} className="bg-white border border-[#141414] p-4">
                    <p className="text-[14px] font-semibold text-[#141414] leading-7">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="mt-2 space-y-2">
                      {q.options.map((option, optionIndex) => {
                        const checked = listeningAnswers[q.id] === optionIndex
                        return (
                          <label
                            key={`${q.id}-${optionIndex}`}
                            className={`flex items-start gap-2 border p-2 cursor-pointer ${
                              checked ? 'border-red-600 bg-[#fff5f5]' : 'border-[#141414]/20 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={checked}
                              onChange={() => handleSelectListeningAnswer(q.id, optionIndex)}
                              className="mt-1"
                            />
                            <span className="text-[13px] text-[#141414] leading-6">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {listeningTest.blanks.length > 0 ? (
                  <div className="bg-white border border-[#141414] p-4 space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#141414]">Điền từ vào chỗ trống</p>
                    {listeningTest.blanks.map((blank, idx) => (
                      <div key={blank.id} className="space-y-1">
                        <p className="text-[13px] text-[#141414]">
                          {idx + 1}. {blank.prompt.replace('____', '_____')}
                        </p>
                        <input
                          value={listeningBlankAnswers[blank.id] || ''}
                          onChange={(e) => handleListeningBlankChange(blank.id, e.target.value)}
                          className="h-10 w-full border border-[#141414]/30 bg-[#F9FAFB] px-3 text-[14px] text-[#141414] focus:outline-none"
                          placeholder="Điền từ/cụm từ bạn nghe được..."
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  onClick={handleGradeListening}
                  disabled={listeningLoading}
                  className={`w-full h-12 border-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                    listeningLoading
                      ? 'border-[#141414]/20 bg-[#E5E7EB] text-[#4B4B4B] cursor-not-allowed'
                      : 'border-[#141414] bg-[#141414] text-white hover:bg-red-600 hover:border-red-600'
                  }`}
                >
                  {listeningLoading ? 'Đang chấm...' : 'Chấm bài nghe'}
                </button>
              </section>
            </div>
          ) : null}

          {listeningResult ? (
            <section className="bg-[#F5F0E8] border border-[#141414] p-6 space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#141414]">Kết quả listening</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Điểm</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">
                    {listeningResult.correctCount}/{listeningResult.totalQuestions}
                  </p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Tỷ lệ đúng</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">{listeningResult.score}%</p>
                </div>
                <div className="bg-white border border-[#141414] p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B]">Cấp độ ước lượng</p>
                  <p className="text-[26px] font-serif font-black text-[#141414]">{listeningResult.levelEstimate}</p>
                </div>
              </div>
              <div className="bg-white border border-[#141414] p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#4B4B4B] mb-1">Nhận xét AI</p>
                <p className="text-[13px] text-[#141414] leading-7 vietnamese-text whitespace-pre-line">{listeningResult.feedbackVi}</p>
              </div>
              {listeningResult.wrongItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {listeningResult.wrongItems.map((item) => (
                    <div key={item.questionId} className="bg-white border border-[#141414] p-3">
                      <p className="text-[13px] font-semibold text-[#141414] leading-6">{item.question}</p>
                      <p className="mt-1 text-[12px] text-red-700 font-semibold">Bạn chọn: {item.userAnswer}</p>
                      <p className="text-[12px] text-green-700 font-semibold">Đáp án đúng: {item.correctAnswer}</p>
                      <p className="mt-1 text-[12px] text-[#4B4B4B] vietnamese-text leading-6">{item.explanationVi}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-green-700 font-semibold">Excellent. Bạn làm đúng toàn bộ câu hỏi.</p>
              )}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
