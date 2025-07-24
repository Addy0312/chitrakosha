import Image, { ImageProps } from 'next/image';

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: Omit<ImageProps, 'src' | 'alt'> & { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      fill={false}
      loading="lazy"
      style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
      {...props}
    />
  );
}
