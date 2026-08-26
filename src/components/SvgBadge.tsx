'use client';

import { useState } from 'react';

type SvgBadgeProps = {
  src: string;
  alt: string;
  unavailableLabel?: string;
};

export default function SvgBadge({ src, alt, unavailableLabel }: SvgBadgeProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex w-full items-center gap-2 border border-white/10 bg-[#0D0D0D] px-5 py-4 text-xs text-[#A1A1AA]">
        <span className="h-2 w-2 bg-white/20" aria-hidden="true" />
        {unavailableLabel ?? `${alt} unavailable`}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-auto w-full"
      onError={() => setFailed(true)}
    />
  );
}
