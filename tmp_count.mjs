import { blogArticles } from './tmp_blogdata.mjs'

const strip = (s) => (s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, '')
const cjk = (s) => {
  const m = (s || '').match(/[　-〿぀-ヿ가-힯一-鿿豈-﫿＀-￯]/g)
  return m ? m.length : 0
}
const langs = ['zh-CN', 'en', 'ja', 'ko', 'zh-TW']
console.log('id    ' + langs.map((l) => l.padEnd(26)).join(''))
for (const a of blogArticles) {
  let line = a.id.padEnd(6)
  for (const l of langs) {
    const loc = a.t[l]
    let txt = loc.title + ' ' + loc.excerpt + ' '
    for (const s of loc.sections) txt += (s.heading || '') + ' ' + (s.body || '') + ' ' + (s.quote || '') + ' ' + (s.list || []).join(' ')
    const vis = strip(txt).length
    const c = cjk(txt)
    line += ('vis=' + vis + ' cjk=' + c).padEnd(26)
  }
  console.log(line)
}
