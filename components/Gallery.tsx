import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site-config";

// Descobre automaticamente as fotos da galeria.
//
// COMO ADICIONAR FOTOS (Lúcia e Francisco):
//   Põe os ficheiros de imagem (.jpg, .jpeg, .png, .webp) dentro da pasta
//   "public/galeria/". Aparecem aqui automaticamente, por ordem do nome do
//   ficheiro (ex.: 01-..., 02-..., 03-...). Não é preciso mexer no código.
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function loadGalleryImages(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "galeria");
    const files = fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "pt"));
    if (files.length > 0) {
      return files.map((f) => `/galeria/${f}`);
    }
  } catch {
    // pasta inexistente ou ilegível — usa a lista de reserva da config
  }
  return [...siteConfig.galleryImages];
}

export default function Gallery() {
  const images = loadGalleryImages();
  if (images.length === 0) return null;

  return (
    <section className="mx-auto mb-14 max-w-5xl px-6">
      <h2 className="mb-6 text-center font-display text-2xl font-700 text-ink">
        A caminho de ti 💛
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`Foto da nossa espera ${i + 1}`}
            className="h-72 w-auto rounded-xl2 object-cover shadow-soft sm:h-96"
          />
        ))}
      </div>
    </section>
  );
}
