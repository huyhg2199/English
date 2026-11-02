import type { Lesson, SectionId } from '@/data/roadmap'

import data from './videos.json'

/**
 * Video YouTube gắn vào một đoạn của bài (story 15). Dữ liệu ở `videos.json` (để `npm run videos:check` đọc
 * được bằng Node thuần). Mọi `id` đã kiểm qua YouTube oEmbed (tồn tại, cho nhúng); `title` và `channel` chép từ
 * kết quả oEmbed, không tự đặt.
 */
export type LessonVideo = {
  /** Video ID của YouTube (11 ký tự). */
  id: string
  title: string
  /** Tên kênh (author_name của oEmbed). */
  channel: string
  lessonId: string
  sectionId: SectionId
  /** Giây bắt đầu phát (bỏ trống = từ đầu). */
  startSec?: number
}

export const LESSON_VIDEOS = data as readonly LessonVideo[]

/** Video của một bài, hoặc của một đoạn trong bài nếu có `sectionId`; giữ thứ tự trong dữ liệu. */
export function videosFor(lessonId: string, sectionId?: string): readonly LessonVideo[] {
  return LESSON_VIDEOS.filter((v) => v.lessonId === lessonId && (sectionId === undefined || v.sectionId === sectionId))
}

/** Video phát ngay trong phần 10' giải trí của buổi 30' (đoạn `entertainment` của bài); không có bài → rỗng. */
export function funStepVideos(lesson: Pick<Lesson, 'id'> | null | undefined): readonly LessonVideo[] {
  return lesson ? videosFor(lesson.id, 'entertainment') : []
}

/**
 * URL iframe (youtube-nocookie). Chỉ dùng sau khi người dùng bấm phát nên có `autoplay=1`;
 * `playsinline=1` để iPhone phát ngay trong trang, `rel=0` để video gợi ý cuối chỉ cùng kênh.
 * `jsapiOrigin`: thêm `enablejsapi=1&origin=…` cho video có phụ đề.
 */
export function embedUrl(video: Pick<LessonVideo, 'id' | 'startSec'>, opts: { jsapiOrigin?: string } = {}): string {
  const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0' })
  if (video.startSec) params.set('start', String(video.startSec))
  // Video có phụ đề (story 16): bật IFrame Player API để đọc thời gian phát; `origin` là origin của app.
  if (opts.jsapiOrigin) {
    params.set('enablejsapi', '1')
    params.set('origin', opts.jsapiOrigin)
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?${params}`
}

/** Link mở video trên YouTube (phương án dự phòng). */
export function watchUrl(video: Pick<LessonVideo, 'id' | 'startSec'>): string {
  const base = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`
  return video.startSec ? `${base}&t=${video.startSec}s` : base
}

/** Ảnh thumbnail (hqdefault luôn có với mọi video). */
export function thumbnailUrl(video: Pick<LessonVideo, 'id'>): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`
}
