import type { Lesson, SectionId } from '@/data/roadmap'

import foundationData from './foundation-videos.json'
import data from './videos.json'

/**
 * Giấy phép của video (story 16): quyết định có được lưu transcript + bản dịch không.
 * - `public-domain`: VOA Learning English (chính phủ Mỹ). Được lưu transcript.
 * - `cc-by`: video YouTube giấy phép "Creative Commons Attribution license (reuse allowed)" (CC BY 3.0). Được lưu
 *   transcript và bản dịch, phải ghi nguồn (kênh + link kênh, link video, giấy phép) và ghi rõ bản dịch do Lumos làm.
 * - `youtube-standard`: giấy phép chuẩn của YouTube (BBC, Rachel's English, TED-Ed…). Chỉ nhúng, không lưu transcript.
 */
export type VideoLicense = 'public-domain' | 'cc-by' | 'youtube-standard'

export const VIDEO_LICENSES: readonly VideoLicense[] = ['public-domain', 'cc-by', 'youtube-standard']

/** Link giấy phép CC BY 3.0 (giấy phép Creative Commons của YouTube). */
export const CC_BY_URL = 'https://creativecommons.org/licenses/by/3.0/'

/**
 * Một video YouTube nhúng trong app. Mọi `id` đã kiểm qua YouTube oEmbed (tồn tại, cho nhúng); `title` và `channel`
 * chép từ kết quả oEmbed, không tự đặt; `license` chép từ trang video (mục giấy phép).
 */
export type Video = {
  /** Video ID của YouTube (11 ký tự). */
  id: string
  title: string
  /** Tên kênh (author_name của oEmbed). */
  channel: string
  /** Link kênh trên YouTube; bắt buộc với video `cc-by` (ghi nguồn). */
  channelUrl?: string
  license: VideoLicense
  /** Giây bắt đầu phát (bỏ trống = từ đầu). */
  startSec?: number
}

/**
 * Video YouTube gắn vào một đoạn của bài (story 15). Dữ liệu ở `videos.json` (để `npm run videos:check` và
 * `npm run subs:fetch` đọc được bằng Node thuần).
 */
export type LessonVideo = Video & {
  lessonId: string
  sectionId: SectionId
}

export const LESSON_VIDEOS = data as readonly LessonVideo[]

/** Video phát trong player (bài học, hoặc giải trí Sân ga không gắn bài). `lessonId` để tô câu theo thì của bài. */
export type PlayableVideo = Video & { lessonId?: string }

/** Video của một bài, hoặc của một đoạn trong bài nếu có `sectionId`; giữ thứ tự trong dữ liệu. */
export function videosFor(lessonId: string, sectionId?: string): readonly LessonVideo[] {
  return LESSON_VIDEOS.filter((v) => v.lessonId === lessonId && (sectionId === undefined || v.sectionId === sectionId))
}

/** Video phát ngay trong phần 10' giải trí của buổi 30' (đoạn `entertainment` của bài); không có bài → rỗng. */
export function funStepVideos(lesson: Pick<Lesson, 'id'> | null | undefined): readonly LessonVideo[] {
  return lesson ? videosFor(lesson.id, 'entertainment') : []
}

/**
 * Video phần "Giải trí nhẹ" của buổi Sân ga (story 21): VOA Let's Learn English Lesson 1, 2 (public domain, đã kiểm
 * oEmbed). Dữ liệu ở `foundation-videos.json`, không gắn bài nào (từ 2026-11-10 hai video này không còn ở bài
 * Chặng 1 vì bài dùng video CC BY có phụ đề). Lesson 3 chưa có id đã kiểm nên chưa thêm.
 */
export const FOUNDATION_FUN_VIDEOS = foundationData as readonly Video[]

/** Video phần giải trí của buổi Sân ga, theo thứ tự trong dữ liệu. */
export function foundationFunVideos(): readonly Video[] {
  return FOUNDATION_FUN_VIDEOS
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
