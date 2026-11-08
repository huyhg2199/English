/**
 * Danh sách từ khởi đầu (CAP-9, story 23): từ mới lấy trước NGSL theo hạng, sau từ chủ đề của viên gạch đã học
 * (`preferredNewWordIds` ở `src/lib/flashcard-session.ts`). Chỉ thực từ (danh, động, tính, trạng từ), chỉ id NGSL đã có
 * dữ liệu AI trong `words.json`; không thêm từ hay dữ liệu từ mới.
 *
 * 60 id theo 4 nhóm: thời gian (15), gia đình (12), nghề (12), lớp học (21).
 * Vắng số 2–100, tên các thứ trong tuần và tên tháng (January…): NGSL 1.2 không có các từ này (viên F06 dạy chúng).
 * Một số từ trùng từ chủ đề viên gạch (vd week, month, hour của F06): học viên đó trước thì từ lên theo viên, không lặp.
 */
const TIME = [
  'day',
  'week',
  'month',
  'year',
  'hour',
  'minute',
  'time',
  'today',
  'tomorrow',
  'yesterday',
  'morning',
  'afternoon',
  'evening',
  'night',
  'weekend',
] as const

const FAMILY = [
  'family',
  'mother',
  'father',
  'parent',
  'child',
  'brother',
  'sister',
  'son',
  'daughter',
  'wife',
  'husband',
  'baby',
] as const

const JOBS = [
  'job',
  'teacher',
  'student',
  'doctor',
  'worker',
  'manager',
  'driver',
  'police',
  'officer',
  'engineer',
  'nurse',
  'farmer',
] as const

const CLASSROOM = [
  'school',
  'class',
  'lesson',
  'book',
  'paper',
  'page',
  'table',
  'chair',
  'desk',
  'board',
  'computer',
  'door',
  'window',
  'clock',
  'pen',
  'bag',
  'phone',
  'question',
  'answer',
  'word',
  'test',
] as const

export const STARTER_WORD_IDS: readonly string[] = [...TIME, ...FAMILY, ...JOBS, ...CLASSROOM].map((w) => `ngsl-${w}`)
