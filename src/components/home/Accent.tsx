// Başlıkta *yıldızlı* kısım serif italik vurgu olur: "Umrenizi *niyetinizle* planlayın"
export default function Accent({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith("*") && p.endsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : p))}
    </>
  );
}
