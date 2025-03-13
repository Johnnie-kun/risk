// components/HeroImage.tsx
import Image from "next/image";
import React from "react";

interface HeroImageProps {
  className?: string;
}

export default function HeroImage({ className = "" }: HeroImageProps): React.ReactElement {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Image
        src="/Hero.png"
        alt="Risk It - Why Not"
        width={900}
        height={800}
        priority
        className="rounded-lg shadow-2xl z-10 relative"
        style={{ 
          objectFit: 'contain',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}
