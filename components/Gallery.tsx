import { siteConfig } from "@/lib/site-config";

export default function Gallery() {
  const images = siteConfig.galleryImages;
  if (!images || images.length === 0) return null;

  return (
    <section className="mx-auto mb-14 max-w-5xl px-6">
      <h2 className="mb-6 text-center font-display text-2xl font-700 text-ink">
        A caminho de ti 💛
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={src}
            alt={`Foto da nossa espera ${i + 1}`}
            className="h-72 w-auto rounded-xl2 object-cover shadow-soft sm:h-96"
          />
        ))}
      </div>
    </section>
  );
}
