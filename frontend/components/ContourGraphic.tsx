import React from "react";

interface ContourProps {
  className?: string;
  variant?: "flow" | "shallow" | "deep";
  size?: number;
}

export const ContourField: React.FC<ContourProps> = ({
  className = "",
  variant = "flow",
  size = 320,
}) => {
  // Palettes per DESIGN.md
  const palette = {
    flow: {
      core: "#155386",
      rim: "#93d9e4",
      bands: ["#93d9e4", "#65a9c2", "#3e7da3", "#225f8d", "#155386"],
    },
    shallow: {
      core: "#e2580e",
      rim: "#f6d88c",
      bands: ["#f6d88c", "#f0b66b", "#ea8f44", "#e57024", "#e2580e"],
    },
    deep: {
      core: "#8b3887",
      rim: "#cdbef2",
      bands: ["#cdbef2", "#b792d4", "#a36cb7", "#944e9d", "#8b3887"],
    },
  }[variant];

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`overflow-visible select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* 5 Concentric Stepped Contour Bands */}
      <path
        d="M 200,20 C 310,25 380,95 375,200 C 370,305 300,380 200,375 C 95,370 25,305 25,200 C 25,95 90,15 200,20 Z"
        fill={palette.bands[0]}
        opacity="0.22"
      />
      <path
        d="M 200,55 C 285,60 345,115 340,200 C 335,285 280,345 200,340 C 115,335 60,285 60,200 C 60,115 115,50 200,55 Z"
        fill={palette.bands[1]}
        opacity="0.36"
      />
      <path
        d="M 200,95 C 265,100 310,140 305,200 C 300,265 260,305 200,305 C 140,305 95,265 95,200 C 95,135 135,90 200,95 Z"
        fill={palette.bands[2]}
        opacity="0.55"
      />
      <path
        d="M 200,135 C 245,140 275,165 275,200 C 275,235 240,270 200,270 C 160,270 130,235 130,200 C 130,165 155,130 200,135 Z"
        fill={palette.bands[3]}
        opacity="0.78"
      />
      <path
        d="M 200,165 C 228,168 245,182 245,200 C 245,218 228,235 200,235 C 172,235 155,218 155,200 C 155,182 172,162 200,165 Z"
        fill={palette.bands[4]}
        opacity="0.95"
      />
    </svg>
  );
};

export const ContourHeroArtwork: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background contour layered well */}
      <svg
        viewBox="0 0 600 600"
        className="absolute -right-20 -top-20 w-[140%] h-[140%] opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M 300,40 C 470,45 570,145 560,300 C 550,455 450,560 300,555 C 145,550 40,455 45,300 C 50,145 130,35 300,40 Z"
          fill="#93d9e4"
        />
        <path
          d="M 300,95 C 430,100 510,180 500,300 C 490,420 410,500 300,495 C 190,490 105,420 110,300 C 115,180 170,90 300,95 Z"
          fill="#65a9c2"
        />
        <path
          d="M 300,155 C 395,160 450,220 445,300 C 440,380 375,445 300,440 C 225,435 165,380 170,300 C 175,220 205,150 300,155 Z"
          fill="#3e7da3"
        />
        <path
          d="M 300,215 C 360,220 395,255 390,300 C 385,345 345,385 300,385 C 255,385 215,345 220,300 C 225,255 240,210 300,215 Z"
          fill="#155386"
        />
        <circle cx="300" cy="300" r="45" fill="#0e3759" />
      </svg>
    </div>
  );
};

export const ContourBadgeSwatch: React.FC<{ variant?: "flow" | "shallow" | "deep" }> = ({
  variant = "flow",
}) => {
  const swatchClass = {
    flow: "m-badge__swatch-flow",
    shallow: "m-badge__swatch-shallow",
    deep: "m-badge__swatch-deep",
  }[variant];

  return <span className={`inline-block shrink-0 ${swatchClass}`} aria-hidden="true" />;
};
