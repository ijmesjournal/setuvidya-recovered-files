import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Background motifs.

   Rule for this system: a background must describe the section it sits
   behind. A citation network sits behind research; ruled journal columns sit
   behind publication; a page stack sits behind book publishing. Nothing here
   is an abstract blob.

   All motifs are decorative, so they are aria-hidden and never carry meaning
   that is not also in the text. Opacity stays between 3% and 7% so that body
   copy keeps full contrast against them.
------------------------------------------------------------------------- */

type MotifProps = { className?: string; opacity?: number; light?: boolean };

function Layer({
  children,
  className,
  opacity = 0.05,
  viewBox = '0 0 1200 640',
}: MotifProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={{ opacity }}
        focusable="false"
      >
        {children}
      </svg>
    </div>
  );
}

const stroke = 'rgb(18 49 79)';
const brass = 'rgb(168 128 44)';
/** On dark sections the motif has to be drawn in light ink instead. */
const inkFor = (light?: boolean) => (light ? 'rgb(255 255 255)' : stroke);
const brassFor = (light?: boolean) => (light ? 'rgb(198 160 78)' : brass);

/* ------------------------------------------------ Home: citation network -- */

/** Deterministic node coordinates: no Math.random, so SSR and client match. */
const NODES: [number, number, number][] = [
  [90, 120, 4], [250, 70, 3], [400, 165, 5], [545, 90, 3], [700, 190, 4],
  [860, 105, 3], [1010, 200, 5], [1140, 120, 3], [160, 300, 3], [330, 380, 4],
  [500, 305, 3], [660, 400, 5], [820, 320, 3], [980, 420, 4], [1120, 340, 3],
  [70, 500, 4], [240, 560, 3], [430, 500, 3], [600, 580, 4], [780, 520, 3],
  [950, 585, 3], [1130, 520, 4],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [0, 8], [8, 9],
  [2, 9], [9, 10], [10, 11], [4, 11], [11, 12], [12, 13], [6, 13], [13, 14],
  [8, 15], [15, 16], [16, 17], [9, 17], [17, 18], [11, 18], [18, 19],
  [19, 20], [13, 20], [20, 21], [14, 21], [3, 10], [5, 12],
];

export function CitationNetworkMotif({ className, opacity = 0.055, light }: MotifProps) {
  const ink = inkFor(light);
  const gold = brassFor(light);
  return (
    <Layer className={className} opacity={opacity}>
      <g stroke={ink} strokeWidth="1" fill="none">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>
      {NODES.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 5 === 0 ? gold : ink} />
      ))}
    </Layer>
  );
}

/* ------------------------------------ Thesis: document outline + margins -- */

export function DocumentOutlineMotif({ className, opacity = 0.05 }: MotifProps) {
  const page = (x: number, y: number, w: number, h: number, key: string) => {
    const lines = [];
    for (let i = 0; i < Math.floor((h - 60) / 22); i++) {
      const full = i % 7 !== 6;
      lines.push(
        <line
          key={`${key}-l${i}`}
          x1={x + 26}
          y1={y + 58 + i * 22}
          x2={x + (full ? w - 26 : w * 0.55)}
          y2={y + 58 + i * 22}
          stroke={stroke}
          strokeWidth="1.4"
        />,
      );
    }
    return (
      <g key={key}>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke} strokeWidth="1.5" />
        {/* running head + chapter rule */}
        <line x1={x + 26} y1={y + 30} x2={x + w * 0.42} y2={y + 30} stroke={brass} strokeWidth="3" />
        <line x1={x + 26} y1={y + 42} x2={x + w - 26} y2={y + 42} stroke={stroke} strokeWidth="1" />
        {lines}
      </g>
    );
  };

  return (
    <Layer className={className} opacity={opacity}>
      {page(60, 40, 300, 420, 'p1')}
      {page(420, 110, 300, 420, 'p2')}
      {page(780, 40, 300, 420, 'p3')}
      {/* margin ruler down the left edge */}
      <g stroke={stroke} strokeWidth="1">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={16} y1={20 + i * 26} x2={i % 4 === 0 ? 40 : 30} y2={20 + i * 26} />
        ))}
      </g>
    </Layer>
  );
}

/* ------------------------- Publication: journal columns, charts, citation -- */

export function JournalColumnsMotif({ className, opacity = 0.05 }: MotifProps) {
  const column = (x: number, y: number, rows: number, key: string) => (
    <g key={key}>
      {Array.from({ length: rows }).map((_, i) => (
        <line
          key={i}
          x1={x}
          y1={y + i * 17}
          x2={x + (i % 9 === 8 ? 120 : 210)}
          y2={y + i * 17}
          stroke={stroke}
          strokeWidth="1.4"
        />
      ))}
    </g>
  );

  const bars = [46, 74, 30, 96, 58, 84, 40];

  return (
    <Layer className={className} opacity={opacity}>
      {/* two-column journal setting */}
      {column(70, 90, 18, 'c1')}
      {column(320, 90, 18, 'c2')}
      {column(880, 300, 14, 'c3')}

      {/* a results figure */}
      <g transform="translate(640,90)">
        <line x1="0" y1="0" x2="0" y2="130" stroke={stroke} strokeWidth="1.5" />
        <line x1="0" y1="130" x2="230" y2="130" stroke={stroke} strokeWidth="1.5" />
        {bars.map((h, i) => (
          <rect
            key={i}
            x={16 + i * 30}
            y={130 - h}
            width="16"
            height={h}
            fill={i === 3 ? brass : stroke}
          />
        ))}
      </g>

      {/* scatter with fit line */}
      <g transform="translate(120,400)">
        <line x1="0" y1="0" x2="0" y2="150" stroke={stroke} strokeWidth="1.5" />
        <line x1="0" y1="150" x2="260" y2="150" stroke={stroke} strokeWidth="1.5" />
        <line x1="10" y1="140" x2="250" y2="26" stroke={brass} strokeWidth="2" strokeDasharray="7 5" />
        {[[26, 128], [52, 120], [78, 104], [104, 96], [130, 82], [156, 70], [182, 58], [208, 44], [234, 34], [66, 112], [144, 88]].map(
          ([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="4" fill={stroke} />,
        )}
      </g>

      {/* bracketed citation marks */}
      <g fill={stroke} fontFamily="Georgia, serif" fontSize="26">
        <text x="560" y="330">[12]</text>
        <text x="470" y="560">[7]</text>
        <text x="1010" y="150">[31]</text>
        <text x="760" y="600">[4]</text>
      </g>
    </Layer>
  );
}

/* ------------------------------------------ Book: page stack and spines --- */

export function PageStackMotif({ className, opacity = 0.055 }: MotifProps) {
  return (
    <Layer className={className} opacity={opacity}>
      {/* shelf of spines */}
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const w = 34 + (i % 3) * 12;
          const x = 70 + i * 62;
          const h = 210 + (i % 4) * 26;
          return (
            <g key={i}>
              <rect x={x} y={430 - h} width={w} height={h} fill="none" stroke={stroke} strokeWidth="1.5" />
              <line x1={x + 8} y1={430 - h + 22} x2={x + w - 8} y2={430 - h + 22} stroke={brass} strokeWidth="2.5" />
              <line x1={x + 8} y1={418} x2={x + w - 8} y2={418} stroke={stroke} strokeWidth="1.5" />
            </g>
          );
        })}
        <line x1="50" y1="432" x2="640" y2="432" stroke={stroke} strokeWidth="2.5" />
      </g>

      {/* open book with fanned pages */}
      <g transform="translate(760,150)">
        <path d="M0 190 C 60 150, 140 150, 200 190 L 200 40 C 140 0, 60 0, 0 40 Z" fill="none" stroke={stroke} strokeWidth="2" />
        <line x1="200" y1="40" x2="200" y2="190" stroke={stroke} strokeWidth="2" />
        <path d="M200 190 C 260 150, 340 150, 400 190 L 400 40 C 340 0, 260 0, 200 40 Z" fill="none" stroke={stroke} strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={30} y1={64 + i * 22} x2={172} y2={54 + i * 22} stroke={stroke} strokeWidth="1.3" />
            <line x1={228} y1={54 + i * 22} x2={370} y2={64 + i * 22} stroke={stroke} strokeWidth="1.3" />
          </g>
        ))}
      </g>
    </Layer>
  );
}

/* ------------------------- Admission: campus arcade and pathway paving ---- */

export function CampusArcadeMotif({ className, opacity = 0.05 }: MotifProps) {
  const arch = (x: number, w: number, h: number, key: string) => (
    <g key={key}>
      <path
        d={`M${x} 430 L${x} ${430 - h} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${430 - h} L${x + w} 430`}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
      />
    </g>
  );

  return (
    <Layer className={className} opacity={opacity}>
      {/* colonnade */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => arch(120 + i * 130, 96, 150, `a${i}`))}
      {/* pediment */}
      <path d="M60 250 L620 250 L620 236 L340 130 L60 236 Z" fill="none" stroke={stroke} strokeWidth="2" />
      <line x1="40" y1="432" x2="1160" y2="432" stroke={stroke} strokeWidth="2.5" />
      {/* dome on the right wing */}
      <g transform="translate(900,0)">
        <path d="M20 300 A 110 110 0 0 1 240 300" fill="none" stroke={stroke} strokeWidth="2" />
        <line x1="20" y1="300" x2="240" y2="300" stroke={stroke} strokeWidth="2" />
        <line x1="130" y1="190" x2="130" y2="150" stroke={brass} strokeWidth="2.5" />
        <rect x="30" y="300" width="200" height="130" fill="none" stroke={stroke} strokeWidth="1.8" />
      </g>
      {/* paved approach path, converging */}
      <g stroke={stroke} strokeWidth="1.2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={420 - i * 70} y1={640} x2={540 - i * 18} y2={440} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={`h${i}`} x1={470 - i * 60} y1={470 + i * 46} x2={640 + i * 60} y2={470 + i * 46} />
        ))}
      </g>
    </Layer>
  );
}

/* ---------------------------------------- Contact: correspondence signal -- */

export function SignalArcsMotif({ className, opacity = 0.05 }: MotifProps) {
  return (
    <Layer className={className} opacity={opacity}>
      <g fill="none" stroke={stroke} strokeWidth="1.5">
        {[70, 150, 230, 310, 390, 470].map((r, i) => (
          <circle key={i} cx="180" cy="330" r={r} strokeDasharray={i % 2 ? '6 8' : undefined} />
        ))}
      </g>
      <circle cx="180" cy="330" r="9" fill={brass} />
      <g fill="none" stroke={stroke} strokeWidth="1.5">
        {[60, 130, 200, 270].map((r, i) => (
          <circle key={i} cx="1020" cy="220" r={r} strokeDasharray={i % 2 ? '6 8' : undefined} />
        ))}
      </g>
      <circle cx="1020" cy="220" r="7" fill={stroke} />
      {/* the correspondence line between the two points */}
      <path d="M180 330 C 460 180, 740 400, 1020 220" fill="none" stroke={brass} strokeWidth="2" strokeDasharray="10 8" />
    </Layer>
  );
}

/* ------------------------------------------------ Neutral: hairline grid -- */

export function GridMotif({ className, opacity = 0.05, light }: MotifProps) {
  const ink = inkFor(light);
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" focusable="false">
        <defs>
          <pattern id="sv-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0 L0 0 0 56" fill="none" stroke={ink} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sv-grid)" />
      </svg>
    </div>
  );
}
