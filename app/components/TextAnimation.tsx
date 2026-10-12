import React from "react";

interface TextAnimationProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    /** Duration of full animation cycle in seconds (default: 4) */
    duration?: number;
    className?: string;
}

export function TextAnimation({
    children,
    duration = 10,
    className = "",
    style,
    ...props
}: TextAnimationProps) {
    return (
        <>
            <style>{`
        @keyframes text-high-contrast-shimmer {
          0% {
            background-position: 150% 0;
          }
          100% {
            background-position: -150% 0;
          }
        }
      `}</style>
            <span
                {...props}
                style={{
                    backgroundImage:
                        "linear-gradient(90deg, #1e1e24 0%, #3f3f46 25%, #ffffff 50%, #3f3f46 75%, #1e1e24 100%)",
                    backgroundSize: "300% 100%",
                    animation: `text-high-contrast-shimmer ${duration}s linear infinite`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    display: "inline-block",
                    ...style,
                }}
                className={`select-none ${className}`}
            >
                {children}
            </span>
        </>
    );
}

export default TextAnimation;