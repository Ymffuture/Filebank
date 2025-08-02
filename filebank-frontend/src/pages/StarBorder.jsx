const StarBorder = ({
  as: Component = "button",
  className = "",
  color = "white",
  speed = "6s",
  thickness = 2,
  children,
  ...rest
}) => {
  return (
    <div className="relative inline-block w-fit overflow-hidden rounded-[20px]">
      <Component 
        className={`relative z-10 inline-block rounded-[20px] ${className}`} 
        style={{
          padding: `${thickness}px 0`,
          ...rest.style
        }}
        {...rest}
      >
        <div className="relative z-10 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px]">
          {children}
        </div>
      </Component>

      {/* Glow Effects */}
      <div
        className="pointer-events-none absolute w-[150%] h-[60%] bottom-0 right-[-25%] opacity-60 rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="pointer-events-none absolute w-[150%] h-[60%] top-0 left-[-25%] opacity-60 rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
    </div>
  );
};

