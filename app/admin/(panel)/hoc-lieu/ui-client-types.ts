export type FlashcardWordView = {
  id: string
  term: string
  definition: string
  example: string
  pronunciation: string
}

export type FlashcardSetView = {
  id: string
  topic: string
  words: number
  level: string
  createdAt: string
  items: FlashcardWordView[]
}

export type GrammarItemView = {
  id: string
  title: string
  level: string
  structure: string
  createdAt: string
}

export type MediaItemView = {
  id: string
  type: 'Ảnh' | 'Âm thanh'
  name: string
  url: string
  size: string
}

export type StudyTab = 'flashcard' | 'grammar' | 'media'
