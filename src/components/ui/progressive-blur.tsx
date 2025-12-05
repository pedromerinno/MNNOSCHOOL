import React from "react";

type ProgressiveBlurProps = {
  className?: string;
  backgroundColor?: string;
  position?: "top" | "bottom";
  height?: string;
  blurAmount?: string;
};

const ProgressiveBlur = ({
  className = "",
  backgroundColor = "#f5f4f3",
  position = "top",
  height = "250px",
  blurAmount = "20px",
}: ProgressiveBlurProps) => {
  const isTop = position === "top";

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 w-full select-none ${className}`}
      style={{
        position: 'absolute',
        [isTop ? "top" : "bottom"]: 0,
        left: 0,
        right: 0,
        height,
        background: isTop
          ? `linear-gradient(to bottom, ${backgroundColor}, transparent)`
          : `linear-gradient(to top, ${backgroundColor}, transparent)`,
        maskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : `linear-gradient(to top, black 50%, transparent)`,
        WebkitMaskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : `linear-gradient(to top, black 50%, transparent)`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitUserSelect: "none",
        userSelect: "none",
        zIndex: 30,
      }}
    />
  );
};

export { ProgressiveBlur };
