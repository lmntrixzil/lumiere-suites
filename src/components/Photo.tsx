import Image, { type ImageProps } from "next/image";
import { imgSrc } from "@/lib/img";

/** next/image wrapper that understands stored photo ids. Always pass `sizes`. */
export function Photo({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={imgSrc(src)} alt={alt} {...rest} />;
}
