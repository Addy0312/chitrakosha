import Image, { ImageProps } from "next/image";

export function DynamicImage(props: ImageProps) {
  return (
    <Image
      {...props}
      loading={props.loading || "lazy"}
      placeholder={props.placeholder || "blur"}
      blurDataURL={props.blurDataURL || "/placeholder.svg"}
      sizes={props.sizes || "(max-width: 768px) 100vw, 33vw"}
      style={{ objectFit: props.style?.objectFit || "cover", ...props.style }}
    />
  );
}
