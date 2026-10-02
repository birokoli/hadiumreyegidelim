import { permanentRedirect } from "next/navigation";

// Eski adımlı tasarlayıcı kaldırıldı; tek sayfalık planlayıcı /bireysel-umre'de
export default function Page() {
  permanentRedirect("/bireysel-umre");
}
