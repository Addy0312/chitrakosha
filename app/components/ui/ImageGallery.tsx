"use client";
import { useState } from 'react';
import ResponsiveImage from './ResponsiveImage';

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  function openLightbox(idx: number) {
    setActive(idx);
    setOpen(true);
  }
  function closeLightbox() {
    setOpen(false);
  }
  function next() {
    setActive((a) => (a + 1) % images.length);
  }
  function prev() {
    setActive((a) => (a - 1 + images.length) % images.length);
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <div key={i} className="cursor-pointer" onClick={() => openLightbox(i)}>
            <ResponsiveImage src={img} alt={alt} className="w-32 h-32 object-cover rounded" />
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-white text-2xl" onClick={closeLightbox}>&times;</button>
            <div className="flex items-center gap-4">
              <button onClick={prev} className="text-white text-3xl px-2">&#8592;</button>
              <div className="relative w-[80vw] max-w-2xl h-[60vh] flex items-center justify-center">
                <img
                  src={images[active]}
                  alt={alt}
                  className="max-h-full max-w-full object-contain cursor-zoom-in"
                  style={{ cursor: 'zoom-in' }}
                  onClick={e => {
                    e.stopPropagation();
                    const img = e.currentTarget;
                    if (img.style.transform) {
                      img.style.transform = '';
                    } else {
                      img.style.transform = 'scale(2)';
                    }
                  }}
                />
              </div>
              <button onClick={next} className="text-white text-3xl px-2">&#8594;</button>
            </div>
            <div className="text-white mt-2">{active + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
