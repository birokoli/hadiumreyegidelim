// Ana sayfa yazı tipleri (6 Ekim, kullanıcı): Cairo (gövde + başlık), hat için Aref Ruqaa.
// Vurgu kelimeleri sitede zaten yüklü Noto Serif italik ile (MBD'deki Georgia italik mantığı).
import { Aref_Ruqaa, Cairo } from "next/font/google";

// 14 Ekim (hız): Cairo değişken yazı tipi olarak (tek dosya, bütün ağırlıklar) ve yalnızca Latin alt kümeleri; Arapça metinler
// hat yazı tipiyle ya da sistem yazı tipiyle gösterilir. Hat süs amaçlı olduğu için önceden yüklenmez (ilk boyamayı bekletmez).
export const cairo = Cairo({ subsets: ["latin", "latin-ext"], variable: "--font-cairo", display: "swap" });
export const ruqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-hat", display: "swap", preload: false });
