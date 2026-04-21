export default function SmartSeasonLogo({
  size = 52,
  stacked = false,
  showWordmark = true,
  light = false,
  subtitle = 'Farm Intelligence',
}) {
  const textColor = light ? 'var(--cream)' : 'var(--soil)'
  const subColor = light ? 'rgba(244, 238, 221, 0.78)' : 'var(--clay)'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: stacked ? 0 : 14, flexDirection: stacked ? 'column' : 'row' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        aria-hidden="true"
        style={{ flexShrink: 0, filter: light ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.18))' : 'none' }}
      >
        <defs>
          <linearGradient id="smartseason-sky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F7A45" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="smartseason-sun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0C55A" />
            <stop offset="100%" stopColor="#C68A1D" />
          </linearGradient>
          <linearGradient id="smartseason-field" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20A45C" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="64" height="64" rx="22" fill={light ? 'rgba(255, 255, 255, 0.18)' : '#fffdf7'} stroke={light ? 'rgba(244, 238, 221, 0.26)' : 'rgba(23, 55, 44, 0.10)'} strokeWidth="1.5" />
        <circle cx="48" cy="22" r="9" fill="url(#smartseason-sun)" />
        <path d="M16 44C23 35 30 30 39 28C35 36 29 44 21 50C19 49 17 47 16 44Z" fill="url(#smartseason-field)" />
        <path d="M17 50C27 42 39 38 56 38V53H17V50Z" fill="url(#smartseason-sky)" opacity="0.16" />
        <path d="M14 48C21 43 28 40 36 39C45 38 52 40 58 45V56H14V48Z" fill="url(#smartseason-field)" />
        <path d="M14 56C20 50 27 47 34 47C42 47 50 50 58 56" fill="none" stroke="#F4EEDD" strokeWidth="2.1" strokeLinecap="round" opacity="0.92" />
        <path d="M14 62C21 56 28 53 36 53C45 53 52 56 58 62" fill="none" stroke="#F4EEDD" strokeWidth="2.1" strokeLinecap="round" opacity="0.74" />
        <path d="M24 47C28 41 33 35 39 28" fill="none" stroke="#F4EEDD" strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <div style={{ textAlign: stacked ? 'center' : 'left' }}>
          <div style={{ fontFamily: 'Marcellus, serif', fontSize: stacked ? '2rem' : '1.15rem', color: textColor, lineHeight: 1.05, letterSpacing: '0.01em' }}>
            SmartSeason
          </div>
          <div style={{ marginTop: 4, fontSize: stacked ? '0.78rem' : '0.68rem', color: subColor, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {subtitle}
          </div>
        </div>
      )}
    </div>
  )
}
