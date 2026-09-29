// Soru önerileri: konu × soru kalıbı × persona. Maliyetsiz, istemcide üretilir.
// Fikir: spotlightsai / ansvisor "prompt discovery" ve geo-aeo-tracker "persona fan-out".

export const TOPICS = [
  "bireysel umre",
  "umre turu",
  "umre vizesi",
  "Kabe'ye yakın otel",
  "lüks umre paketi",
  "ekonomik umre",
  "ramazan umresi",
];

const TEMPLATES = [
  (t: string) => `${t} için hangi firmayı önerirsin?`,
  (t: string) => `Türkiye'den ${t} nasıl yapılır, adım adım anlatır mısın?`,
  (t: string) => `${t} fiyatları ${new Date().getFullYear()} yılında ne kadar?`,
  (t: string) => `Güvenilir bir ${t} firması nasıl seçilir?`,
];

export const PERSONAS = [
  { tag: "ilk kez", lead: "İlk kez umreye gideceğim." },
  { tag: "yaşlı ebeveyn", lead: "70 yaşındaki annemle umreye gitmek istiyorum." },
  { tag: "tek kadın", lead: "Tek başına umreye gitmek isteyen bir kadınım." },
  { tag: "aile", lead: "İki çocuğumla birlikte aile olarak umreye gideceğiz." },
];

export type Suggestion = { text: string; tags: string[] };

export function suggestPrompts(extraTopics: string[] = []): Suggestion[] {
  const topics = [...new Set([...extraTopics, ...TOPICS])];
  const out: Suggestion[] = [];
  for (const t of topics) for (const tpl of TEMPLATES) out.push({ text: tpl(t), tags: ["öneri", t] });
  return out;
}

/** Bir soruyu personalara göre çoğaltır */
export function personaVariants(base: string): Suggestion[] {
  return PERSONAS.map((p) => ({ text: `${p.lead} ${base}`, tags: ["persona", p.tag] }));
}
