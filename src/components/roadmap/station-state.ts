import type { RoadmapProgress } from '@/lib/roadmap-progress'

import type { StationState } from './Station'

/** Trạng thái một trạm trên bản đồ (dùng chung cho `StageMap` và nhãn kiểm tra bài của `Roadmap`, story 41). */
export function stationState(id: string, progress: RoadmapProgress): StationState {
  if (progress.completed.has(id)) return 'done'
  if (progress.nextLessonId === id) return 'next'
  if (progress.skipped.has(id)) return 'skipped'
  return 'locked'
}
