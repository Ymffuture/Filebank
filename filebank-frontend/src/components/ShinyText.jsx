// ShinyText.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

/**
 * ShinyText
 *
 * Props:
 * - text: string (optional) — one of text or children used
 * - children: node (optional)
 * - disabled: boolean — turn animation off
 * - speed: number — seconds for one shimmer cycle
 * - className: string — extra classes
 * - gradientColors: [string, string, string] — 3 stops for the shimmer gradient
 * - direction: "left" | "right" — direction of shimmer movement
 * - shimmerWidthPercent: number — width of the light band as a percent (10 = narrow, 40 = wide)
 * - pauseOnHover: boolean — pause animation while hovered
 */
const KEYFRAME_ID = "shiny-text-keyframes-v1";

function injectKeyframesIfNeeded() {
  // Only run in browser
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAME_ID)) return;

  const style = document.createElement("style");
  style.id = KEYFRAME_ID;

  // The animation uses background-position to create a shimmer.
  style.innerHTML = `
    @keyframes shiny-text-shimmer {
      0% { background-position: -200% 50%; }
      100% { background-position: 200% 50%; }
    }

    /* keep selection readable: when text is selected fall back to color */
    .shiny-text::selection {
      background: rgba(0,0,0,0.75);
    }
  `;

  document.head.appendChild(style);
}

const ShinyText = ({
  text,
  children,
  disabled = false,
  speed = 2,
  className = "text-gray-600",
  gradientColors = ["rgba(255,255,255,0)", "rgba(255,255,255,0.9)", "rgba(255,255,255,0)"],
  direction = "left",
  shimmerWidthPercent = 30,
  pauseOnHover = true,
  style = {color:"gray"},
  ...rest
}) => {
  // prefer-reduced-motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReducedMotion(Boolean(mq && mq.matches));
    handler();
    if (mq && mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq && mq.addListener) mq.addListener(handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener("change", handler);
      else if (mq && mq.removeListener) mq.removeListener(handler);
    };
  }, []);

  // Inject keyframes only on client once
  useEffect(() => {
    injectKeyframesIfNeeded();
  }, []);

  // animation state for pause-on-hover
  const [isHovered, setIsHovered] = useState(false);
  const isPaused = disabled || prefersReducedMotion || (pauseOnHover && isHovered);

  // compute gradient and animation style
  const gradient = useMemo(() => {
    // create a 3-stop gradient, center stop is narrow based on shimmerWidthPercent
    // We'll construct a gradient that moves across via background-position animation.
    const [stop1, stop2, stop3] = gradientColors;
    // adjust stops to control band width
    const band = Math.max(6, Math.min(60, shimmerWidthPercent)); // ensure proper range
    // We place stops with percentages so the band is narrow
    return `linear-gradient(90deg, ${stop1} 0%, ${stop1} ${50 - band/2}%, ${stop2} 50%, ${stop3} ${50 + band/2}%, ${stop3} 100%)`;
  }, [gradientColors, shimmerWidthPercent]);

  const animationDuration = `${Math.max(0.1, Number(speed) || 5)}s`;
  const dirMultiplier = direction === "left" ? -1 : 1;

  const baseStyle = {
    display: "inline-block",
    // use background clip to color text with gradient
    backgroundImage: gradient,
    backgroundSize: "200% 100%", // make wider for movement
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent", // make text show gradient
    WebkitTextFillColor: "transparent", // Safari
    // animation
    animationName: disabled || prefersReducedMotion ? "none" : "shiny-text-shimmer",
    animationDuration,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationPlayState: isPaused ? "paused" : "running",
    ...style,
  };

  return (
    <span
      className={`shiny-text ${className}`}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {text ?? children}
    </span>
  );
};

ShinyText.propTypes = {
  text: PropTypes.node,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  speed: PropTypes.number,
  className: PropTypes.string,
  gradientColors: PropTypes.arrayOf(PropTypes.string),
  direction: PropTypes.oneOf(["left", "right"]),
  shimmerWidthPercent: PropTypes.number,
  pauseOnHover: PropTypes.bool,
  style: PropTypes.object,
};

export default ShinyText;

