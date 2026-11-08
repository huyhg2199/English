// Khai báo kiểu cho example-features.mjs (để test TypeScript import được).
export type ExampleFeature = 'past' | 'future' | 'continuous' | 'perfect' | 'modal' | 'comparative' | 'conditional'
export const EXAMPLE_FEATURES: readonly ExampleFeature[]
export function exampleFeatures(sentence: string): ExampleFeature[]
export type LabelStatus = 'clean' | 'override' | 'accepted' | 'todo'
export type LabelEntry = { id: string; rank: number; exampleEn: string; features: ExampleFeature[]; status: LabelStatus }
export function labelExamples(input: {
  words: readonly { id: string; rank: number; exampleEn?: string }[]
  reviewIds: Iterable<string>
  overrides: Readonly<Record<string, { exampleEn: string; exampleVi: string }>>
  accepted: Readonly<Record<string, string>>
}): LabelEntry[]
