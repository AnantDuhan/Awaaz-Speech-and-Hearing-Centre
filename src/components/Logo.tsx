import Image from "next/image";
import logoImage from "@/app/apple-icon.png";

export const SPEECH_BUBBLE_PATH =
  "M10 12c0-4 3-7 7-7h30c4 0 7 3 7 7v24c0 4-3 7-7 7H29l-12 11V43c-4 0-7-3-7-7z";

// The words in the header lockup, matching the logo files. site.name stays the
// full name for page titles, the footer and Google.
export const LOGO_NAME = "Awaaz";
export const LOGO_TAGLINE = "Speech & Hearing Centre";
export const LOGO_IMAGE = logoImage;

type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 48 }: LogoMarkProps) {
  return (
    <Image
      src={LOGO_IMAGE}
      width={Math.round((size * LOGO_IMAGE.width) / LOGO_IMAGE.height)}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
