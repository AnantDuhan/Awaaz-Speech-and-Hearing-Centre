export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        d="M8 10c0-3 2-5 5-5h22c3 0 5 2 5 5v18c0 3-2 5-5 5H22l-9 8v-8c-3 0-5-2-5-5z"
        style={{ fill: "var(--highlight)" }}
      />
      <g style={{ fill: "var(--navy)" }}>
        <rect x="15" y="16" width="3" height="8" rx="1.5" />
        <rect x="20" y="12" width="3" height="16" rx="1.5" />
        <rect x="25" y="14" width="3" height="12" rx="1.5" />
        <rect x="30" y="17" width="3" height="6" rx="1.5" />
      </g>
    </svg>
  );
}
