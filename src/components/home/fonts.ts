// Ana sayfa yazı tipleri (6 Ekim, kullanıcı): Cairo (gövde + başlık), hat için Aref Ruqaa.
// Vurgu kelimeleri sitede zaten yüklü Noto Serif italik ile (MBD'deki Georgia italik mantığı).
import { Aref_Ruqaa, Cairo } from "next/font/google";

export const cairo = Cairo({ subsets: ["latin", "latin-ext", "arabic"], weight: ["400", "500", "600", "700", "800"], variable: "--font-cairo", display: "swap" });
export const ruqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-hat", display: "swap" });
