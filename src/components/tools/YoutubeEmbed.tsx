"use client";

import type { HTMLAttributes } from "react";

/**
 * YoutubeEmbed renders an iframe for a YouTube video with sensible defaults
 * for autoplaying silently and disabling user controls. It's wrapped in
 * a responsive container so it always maintains a 16:9 aspect ratio. To
 * disable interaction (e.g. prevent pausing) the iframe is given
 * pointer‑events: none via CSS.
 */
export default function YoutubeEmbed({
  videoId,
  className = "",
  ...props
}: {
  /**
   * The YouTube video ID (e.g. l3HklRyAYDc for https://www.youtube.com/watch?v=l3HklRyAYDc).
   */
  videoId: string;
} & HTMLAttributes<HTMLDivElement>) {
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&rel=0`;
  return (
    <div
      className={
        "relative w-full overflow-hidden rounded-none pointer-events-none " +
        className
      }
      {...props}
    >
      <div className="pt-[56.25%]" />
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        title="YouTube video"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
      />
    </div>
  );
}