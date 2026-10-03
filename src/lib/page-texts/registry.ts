// Sayfa metinleri kayıt defteri: sitede görünen her sabit metin burada bir alan olarak tanımlanır.
// Varsayılan değer koddadır; admin → Sayfa Metinleri'nde değiştirilirse Setting "PAGE_TEXTS:<sayfa>" (JSON) kullanılır.
// Yeni metin eklemek: ilgili sayfanın fields listesine { key, label, default, multiline? } ekle, sayfada t("key") ile oku.

export type TextField = { key: string; label: string; default: string; multiline?: boolean; help?: string };
export type PageTextDef = { id: string; label: string; path: string; fields: TextField[] };

export const PAGE_TEXTS: PageTextDef[] = [
  {
    id: "hakkimizda",
    label: "Hakkımızda",
    path: "/hakkimizda",
    fields: [
      { key: "kicker", label: "Üst etiket", default: "Biz Kimiz" },
      { key: "title", label: "Başlık (H1)", default: "Hadi Umreye Gidelim" },
      { key: "lead", label: "Giriş", multiline: true, default: "Kalabalık kafilelere ve standart programlara bağlı kalmadan, ailenize özel bireysel umre deneyimi sunan bir organizasyon platformuyuz." },
    ],
  },
];

export const pageTextDef = (id: string) => PAGE_TEXTS.find((p) => p.id === id);
export const pageTextsSettingKey = (id: string) => `PAGE_TEXTS:${id}`;
