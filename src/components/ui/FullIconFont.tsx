// Tam ikon yazı tipi (Google Material Symbols, ~340 KB). Herkese açık sayfalar yalnızca kullandıkları
// ikonları içeren küçük alt kümeyi (public/fonts/icons, globals.css) yükler; ikonu veriden ya da
// yönetici seçiminden gelen alanlar (admin, influencer paneli, kampanya sayfaları) bunu ekler.
export default function FullIconFont() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@300,0,0&display=block"
      precedence="default"
    />
  );
}
