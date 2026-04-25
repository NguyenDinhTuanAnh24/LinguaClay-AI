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

export type FlashcardTabAction =
  | { type: 'open_create' }
  | { type: 'open_edit'; set: FlashcardSetView }
  | { type: 'open_import_csv' }
  | { type: 'view_words'; set: FlashcardSetView }
  | { type: 'delete'; id: string; set?: FlashcardSetView }

export type GrammarTabAction =
  | { type: 'open_create' }
  | { type: 'open_edit'; row: GrammarItemView }
  | { type: 'delete'; id: string; title: string }

export type MediaTabAction =
  | { type: 'open_create' }
  | { type: 'open_edit'; file: MediaItemView }
  | { type: 'open_import_csv' }
  | { type: 'delete'; id: string; name: string }
