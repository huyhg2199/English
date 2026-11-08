// Máy dò ngữ pháp trong câu ví dụ (story 24). Logic thuần, xác định: cùng câu luôn cho cùng nhãn, đúng thứ tự
// `EXAMPLE_FEATURES`. Chỉ là bộ lọc thô (regex + danh sách từ): báo nhầm thì ghi vào `accepted` kèm lý do, bỏ sót thì
// người rà tay viết override (`src/data/vocab/example-overrides.json`).
//
// Ngữ pháp được dùng trong câu ví dụ: Sân ga F01–F18 + hiện tại đơn (khẳng định, phủ định, câu hỏi). Mỗi nhãn là một thứ
// chưa học ở giai đoạn đó.

/** 7 nhãn, theo thứ tự trả về của `exampleFeatures`. */
export const EXAMPLE_FEATURES = Object.freeze([
  'past',
  'future',
  'continuous',
  'perfect',
  'modal',
  'comparative',
  'conditional',
])

/**
 * Quá khứ bất quy tắc thông dụng. Bỏ dạng trùng hiện tại (put, cut, read, set, let, hit, cost, hurt, shut, quit, spread,
 * split, beat) và dạng trùng danh từ hay gặp hơn (bit, ground, wound, lay).
 */
const IRREGULAR_PAST = new Set([
  'was', 'were', 'did', 'had', 'went', 'came', 'saw', 'ate', 'drank', 'took', 'made', 'got', 'gave', 'found', 'told',
  'said', 'thought', 'knew', 'left', 'felt', 'bought', 'brought', 'began', 'broke', 'chose', 'drove', 'fell', 'forgot',
  'flew', 'grew', 'heard', 'held', 'kept', 'lost', 'met', 'paid', 'ran', 'sent', 'sold', 'sat', 'slept', 'spoke',
  'spent', 'stood', 'taught', 'understood', 'wrote', 'won', 'wore', 'woke', 'built', 'caught', 'fought', 'meant',
  'rode', 'rang', 'sang', 'swam', 'threw', 'became', 'hid', 'blew', 'drew', 'fed', 'led', 'lent',
  'shook', 'shot', 'stole', 'stuck', 'struck', 'swept', 'tore', 'wept', 'dug', 'hung', 'sank', 'sprang',
  'froze', 'forgave', 'arose', 'awoke', 'bent', 'bled', 'bred', 'burnt', 'dealt', 'dreamt', 'fled', 'leapt', 'learnt',
  'lit', 'sought', 'spun', 'spat', 'sped', 'stung', 'swung', 'rose', 'shone', 'slid',
  'smelt', 'spelt', 'spilt', 'withdrew', 'overcame', 'undertook', 'mistook', 'used',
  // phân từ hai bất quy tắc (bị động / hoàn thành)
  'been', 'done', 'gone', 'seen', 'taken', 'eaten', 'given', 'written', 'known', 'spoken', 'broken', 'chosen',
  'driven', 'fallen', 'forgotten', 'flown', 'grown', 'hidden', 'ridden', 'risen', 'shown', 'stolen', 'sung', 'swum',
  'thrown', 'woken', 'worn', 'begun', 'drunk', 'born', 'drawn', 'frozen', 'forgiven', 'shaken', 'torn', 'mistaken',
  'gotten', 'proven', 'sewn', 'beaten', 'bitten', 'blown', 'rung', 'sunk', 'withdrawn', 'overtaken', 'undertaken',
])

/** Từ đuôi -ed không phải động từ quá khứ. */
const ED_NOT_PAST = new Set(['bed', 'red', 'shed', 'wed', 'sled', 'hundred', 'naked', 'wicked', 'sacred', 'ted', 'fred'])

const BE_FORMS = ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "'m", "'re", "'s", "isn't", "aren't", "wasn't", "weren't"]
const HAVE_FORMS = ['have', 'has', 'had', "'ve", "'d", "haven't", "hasn't", "hadn't"]
/** Trạng từ hay chen giữa trợ động từ và động từ chính. */
const ADVERBS = new Set(['not', 'still', 'always', 'just', 'now', 'also', 'really', 'never', 'usually', 'often', 'already', 'ever', 'recently', 'all', 'only', 'even', 'currently', 'probably'])

/** Danh / tính từ đuôi -ing thường đứng sau "be" mà không phải tiếp diễn. */
const ING_NOT_CONTINUOUS = new Set([
  'something', 'nothing', 'anything', 'everything', 'thing', 'king', 'ring', 'spring', 'sing', 'bring', 'wing',
  'string', 'morning', 'evening', 'ceiling', 'during', 'interesting', 'boring', 'amazing', 'exciting', 'surprising',
  'confusing', 'relaxing', 'tiring', 'shocking', 'charming', 'missing', 'outstanding', 'willing', 'loving', 'caring',
  'disappointing', 'embarrassing', 'frightening', 'annoying', 'satisfying', 'refreshing', 'pleasing', 'challenging',
  'encouraging', 'promising', 'touching', 'worrying', 'amusing', 'convincing', 'demanding', 'interesting',
])

const MODALS = new Set([
  'can', 'could', 'would', 'should', 'may', 'might', 'must', 'shall', 'ought',
  "can't", 'cannot', "couldn't", "wouldn't", "shouldn't", "mustn't", "mightn't", "needn't",
])

/** Đuôi -est không phải so sánh nhất. */
const EST_NOT_SUPERLATIVE = new Set([
  'rest', 'west', 'test', 'best', 'forest', 'guest', 'interest', 'request', 'contest', 'chest', 'nest', 'protest',
  'suggest', 'invest', 'harvest', 'quest', 'arrest', 'honest', 'modest', 'digest', 'vest', 'pest', 'priest', 'latest',
  'manifest', 'conquest', 'midwest', 'northwest', 'southwest',
])

/** Từ đứng trước so sánh nhất -est. */
const SUPERLATIVE_BEFORE = new Set(['the', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])

/** Từ đứng sau "going to" mà không phải động từ (đi tới đâu đó: tiếp diễn, không phải tương lai). */
const NOT_VERB_AFTER_GOING_TO = new Set(['the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their', 'school', 'work', 'bed', 'church', 'town', 'class'])

function tokenize(sentence) {
  const tokens = String(sentence).toLowerCase().replace(/’/g, "'").match(/[a-z']+/g) ?? []
  return tokens.map((t) => t.replace(/^'+/, '').replace(/'+$/, '')).filter((t) => t !== '')
}

/** Tách đuôi rút gọn: "i'll" → ["i", "'ll"], "didn't" giữ nguyên. */
function splitContractions(tokens) {
  const out = []
  for (const t of tokens) {
    const m = t.match(/^([a-z]+)('ll|'d|'ve|'m|'re|'s)$/)
    if (m) out.push(m[1], m[2])
    else out.push(t)
  }
  return out
}

function isPastForm(t) {
  if (IRREGULAR_PAST.has(t)) return true
  if (t.endsWith("n't")) return t === "didn't" || t === "wasn't" || t === "weren't" || t === "hadn't"
  return /^[a-z]{2,}ed$/.test(t) && !t.endsWith('eed') && !ED_NOT_PAST.has(t)
}

function isParticiple(t) {
  return isPastForm(t) && !['was', 'were', 'did', 'went', 'came', 'saw', 'ate', 'drank', 'took', 'gave', 'knew', 'began', 'broke', 'chose', 'drove', 'fell', 'forgot', 'flew', 'grew', 'rode', 'rang', 'sang', 'swam', 'threw', 'became', 'wore', 'woke', 'spoke', 'stole', 'tore', 'blew', 'drew', 'shook', 'froze', 'rose', "didn't", "wasn't", "weren't"].includes(t)
}

/** Từ ở vị trí `i + 1`, bỏ qua tối đa một trạng từ chen giữa. */
function nextMain(tokens, i) {
  let j = i + 1
  if (j < tokens.length && ADVERBS.has(tokens[j])) j++
  return j < tokens.length ? tokens[j] : undefined
}

/**
 * Nhãn ngữ pháp chưa học trong câu, theo thứ tự `EXAMPLE_FEATURES`, không trùng. Câu sạch → `[]`.
 * @param {string} sentence
 * @returns {string[]}
 */
export function exampleFeatures(sentence) {
  const raw = tokenize(sentence)
  const tokens = splitContractions(raw)
  const found = new Set()

  // past: quá khứ bất quy tắc / phân từ hai, đuôi -ed, did/was/were, used to.
  if (raw.some(isPastForm)) found.add('past')

  // future: will / 'll / won't / shall / gonna, be going to + động từ.
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === 'will' || t === "'ll" || t === "won't" || t === 'shall' || t === 'gonna') found.add('future')
    if (t === 'going' && tokens[i + 1] === 'to' && tokens[i + 2] !== undefined && !NOT_VERB_AFTER_GOING_TO.has(tokens[i + 2])) {
      if (i > 0 && BE_FORMS.includes(tokens[i - 1] ?? '')) found.add('future')
    }
  }

  // continuous: be (+ trạng từ) + V-ing.
  for (let i = 0; i < tokens.length; i++) {
    if (!BE_FORMS.includes(tokens[i])) continue
    const next = nextMain(tokens, i)
    if (next !== undefined && /^[a-z]{2,}ing$/.test(next) && !ING_NOT_CONTINUOUS.has(next)) found.add('continuous')
  }

  // perfect: have/has/had/'ve (+ trạng từ) + phân từ hai.
  for (let i = 0; i < tokens.length; i++) {
    if (!HAVE_FORMS.includes(tokens[i])) continue
    const next = nextMain(tokens, i)
    if (next !== undefined && isParticiple(next)) found.add('perfect')
  }

  // modal: can/could/would/should/may/might/must (+ phủ định), 'd (= would), have to / has to / had to.
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (MODALS.has(t)) found.add('modal')
    if (t === "'d" && !isParticiple(tokens[i + 1] ?? '')) found.add('modal')
    if ((t === 'have' || t === 'has' || t === 'had') && tokens[i + 1] === 'to') found.add('modal')
  }

  // comparative: than, more/most/less/least + từ, better/best/worse/worst, the / từ sở hữu + -est.
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === 'than' || t === 'better' || t === 'best' || t === 'worse' || t === 'worst') found.add('comparative')
    if ((t === 'more' || t === 'most' || t === 'less' || t === 'least') && tokens[i + 1] !== undefined) found.add('comparative')
    if (SUPERLATIVE_BEFORE.has(t) && /^[a-z]{3,}est$/.test(tokens[i + 1] ?? '') && !EST_NOT_SUPERLATIVE.has(tokens[i + 1])) {
      found.add('comparative')
    }
  }

  // conditional: if / unless.
  if (tokens.includes('if') || tokens.includes('unless')) found.add('conditional')

  return EXAMPLE_FEATURES.filter((f) => found.has(f))
}

/**
 * Gắn nhãn tập rà (thuần, xác định). Mỗi mục `{ id, rank, exampleEn, features, status }` theo hạng rồi id; `exampleEn` là
 * câu hiệu lực (override nếu có), `features` là nhãn của câu đó. `status`:
 * - `override`: có câu thay thế và câu đó sạch (câu thay thế còn nhãn → `todo`);
 * - `clean`: câu AI không bị gắn nhãn;
 * - `accepted`: câu AI bị gắn nhãn nhưng nằm trong `accepted` (giữ, có lý do);
 * - `todo`: còn phải viết override hoặc ghi lý do.
 * Id không có trong bộ từ hoặc chưa có câu ví dụ bị bỏ qua.
 */
export function labelExamples({ words, reviewIds, overrides, accepted }) {
  const byId = new Map(words.map((w) => [w.id, w]))
  const entries = []
  for (const id of new Set(reviewIds)) {
    const w = byId.get(id)
    if (!w || typeof w.exampleEn !== 'string') continue
    const override = Object.hasOwn(overrides, id) ? overrides[id] : undefined
    const exampleEn = override ? override.exampleEn : w.exampleEn
    const features = exampleFeatures(exampleEn)
    let status
    if (override) status = features.length === 0 ? 'override' : 'todo'
    else if (features.length === 0) status = 'clean'
    else status = Object.hasOwn(accepted, id) ? 'accepted' : 'todo'
    entries.push({ id, rank: w.rank, exampleEn, features, status })
  }
  return entries.sort((a, b) => a.rank - b.rank || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}
