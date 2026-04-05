export function ZorvynLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Zorvyn logo"
      role="img"
    >
      {/* Shield / hex shape */}
      <path
        d="M16 2L28 8.5V19.5L16 30L4 19.5V8.5L16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      {/* Inner circuit lines */}
      <path
        d="M16 7L23 11V20L16 25L9 20V11L16 7Z"
        stroke="url(#zorvyn-grad)"
        strokeWidth="2"
        fill="none"
      />
      {/* Center node */}
      <circle cx="16" cy="16" r="3" fill="url(#zorvyn-grad)" />
      {/* Circuit traces */}
      <line x1="16" y1="13" x2="16" y2="7" stroke="url(#zorvyn-grad)" strokeWidth="1.5" />
      <line x1="18.6" y1="17.5" x2="23" y2="20" stroke="url(#zorvyn-grad)" strokeWidth="1.5" />
      <line x1="13.4" y1="17.5" x2="9" y2="20" stroke="url(#zorvyn-grad)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="zorvyn-grad" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}