/* -------------------------------------------------------------------------
   The bridge span. This is the one place the design spends its boldness.

   Four piers carry the arc, and each pier is drawn as the artefact it stands
   for: a manuscript page, a results chart, a bound book, a university arch.
   The span draws itself left to right once on load; the piers rise after it
   passes. Everything is stroke-based so it stays crisp at any size and adds
   no image weight.
------------------------------------------------------------------------- */

const PIERS = [
  { x: 92, label: 'Research' },
  { x: 292, label: 'Knowledge' },
  { x: 492, label: 'Publication' },
  { x: 692, label: 'Success' },
];

const DECK_Y = 288;

export function HeroSpan({ className }: { className?: string }) {
  return (
    <div className={className}>
      <HeroSpanSvg />

      {/* Readable stand-in for the in-drawing labels on narrow screens. */}
      <ol className="mt-1 flex items-center justify-between gap-1 sm:hidden" aria-hidden="true">
        {PIERS.map((pier, i) => (
          <li key={pier.label} className="flex items-center gap-1">
            <span className="text-[0.82rem] font-medium text-body">{pier.label}</span>
            {i < PIERS.length - 1 ? (
              <span className="text-brass" aria-hidden="true">
                &rarr;
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function HeroSpanSvg() {
  return (
    <svg
      viewBox="0 0 784 420"
      className="h-auto w-full"
      role="img"
      aria-label="A bridge whose four piers represent research, knowledge, publication and academic success, connected by a single span."
      focusable="false"
    >
      <defs>
        <linearGradient id="sv-deck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(18 49 79)" stopOpacity="0.35" />
          <stop offset="45%" stopColor="rgb(43 74 139)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(168 128 44)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* faint water/ground rules under the deck */}
      <g stroke="rgb(18 49 79)" strokeOpacity="0.14" strokeWidth="1">
        {[336, 356, 376, 396].map((y, i) => (
          <line key={y} x1={40 + i * 26} y1={y} x2={744 - i * 26} y2={y} strokeDasharray={i % 2 ? '3 12' : '30 16'} />
        ))}
      </g>

      {/* ------------------------------------------------ the arc and deck */}
      <path
        d={`M52 ${DECK_Y} C 210 96, 574 96, 732 ${DECK_Y}`}
        fill="none"
        stroke="url(#sv-deck)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="sv-span-path"
        style={{ ['--sv-dash' as string]: '820' }}
      />
      <line
        x1="52"
        y1={DECK_Y}
        x2="732"
        y2={DECK_Y}
        stroke="rgb(18 49 79)"
        strokeWidth="3"
        strokeLinecap="round"
        className="sv-span-path"
        style={{ ['--sv-dash' as string]: '700', animationDelay: '160ms' }}
      />

      {/* hangers from arc to deck */}
      <g stroke="rgb(18 49 79)" strokeOpacity="0.3" strokeWidth="1.2">
        {[132, 192, 252, 332, 392, 452, 532, 592, 652].map((x, i) => {
          const t = (x - 52) / 680;
          const y = 288 - 4 * 192 * t * (1 - t) * 0.98;
          return <line key={x} x1={x} y1={DECK_Y} x2={x} y2={y + 6} className="sv-span-node" style={{ animationDelay: `${700 + i * 40}ms` }} />;
        })}
      </g>

      {/* ------------------------------------------------------- the piers */}
      {PIERS.map((pier, i) => (
        <g key={pier.label} className="sv-span-node" style={{ animationDelay: `${900 + i * 170}ms` }}>
          {/* pier shaft */}
          <line x1={pier.x} y1={DECK_Y} x2={pier.x} y2={334} stroke="rgb(18 49 79)" strokeWidth="2.5" />
          <circle cx={pier.x} cy={DECK_Y} r="5" fill="rgb(168 128 44)" />

          {/* the artefact each pier carries, drawn above the deck */}
          <g transform={`translate(${pier.x - 34}, 178)`} stroke="rgb(18 49 79)" strokeWidth="1.8" fill="none">
            {i === 0 ? (
              <>
                <rect x="6" y="0" width="56" height="74" />
                <line x1="16" y1="16" x2="42" y2="16" stroke="rgb(168 128 44)" strokeWidth="3" />
                <line x1="16" y1="30" x2="52" y2="30" strokeWidth="1.4" />
                <line x1="16" y1="42" x2="52" y2="42" strokeWidth="1.4" />
                <line x1="16" y1="54" x2="38" y2="54" strokeWidth="1.4" />
              </>
            ) : null}

            {i === 1 ? (
              <>
                <circle cx="34" cy="24" r="5" fill="rgb(18 49 79)" stroke="none" />
                <circle cx="10" cy="52" r="4" fill="rgb(18 49 79)" stroke="none" />
                <circle cx="58" cy="52" r="4" fill="rgb(18 49 79)" stroke="none" />
                <circle cx="34" cy="72" r="4" fill="rgb(168 128 44)" stroke="none" />
                <path d="M34 24 L10 52 M34 24 L58 52 M10 52 L34 72 M58 52 L34 72 M10 52 L58 52" strokeWidth="1.3" />
              </>
            ) : null}

            {i === 2 ? (
              <>
                <line x1="8" y1="4" x2="8" y2="74" />
                <line x1="8" y1="74" x2="64" y2="74" />
                <rect x="16" y="46" width="10" height="28" fill="rgb(18 49 79)" stroke="none" />
                <rect x="32" y="30" width="10" height="44" fill="rgb(18 49 79)" stroke="none" />
                <rect x="48" y="14" width="10" height="60" fill="rgb(168 128 44)" stroke="none" />
              </>
            ) : null}

            {i === 3 ? (
              <>
                <path d="M6 74 L6 40 A 28 28 0 0 1 62 40 L62 74" />
                <line x1="6" y1="74" x2="62" y2="74" />
                <line x1="34" y1="18" x2="34" y2="74" strokeWidth="1.3" />
                <circle cx="34" cy="12" r="4" fill="rgb(168 128 44)" stroke="none" />
              </>
            ) : null}
          </g>

          {/* Hidden below 640px: inside the viewBox this text scales with the
              drawing, which lands around 6px on a phone. The labels are shown
              as real HTML underneath instead. */}
          <text
            x={pier.x}
            y="368"
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill="rgb(71 86 105)"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            className="hidden sm:block"
          >
            {pier.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
