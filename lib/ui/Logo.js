export function Logo({ size = 'md', className = '' }) {
  const wordmarkSize = size === 'lg' ? 'text-2xl' : 'text-lg';
  const iconSize = size === 'lg' ? 'h-9 w-9' : 'h-7 w-7';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className={iconSize} fill="none" aria-hidden="true">
        <path d="M4 8 L18 20 L4 32" stroke="#E8192C" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
        <path d="M16 8 L30 20 L16 32" stroke="#E8192C" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
      </svg>
      <div>
        <div className={`font-bold tracking-wide text-white leading-none ${wordmarkSize}`}>
          NAVIGATE YS
        </div>
        <div className="text-[10px] tracking-[0.2em] text-nys-faint leading-none mt-1">
          WE GUIDE HEROES
        </div>
      </div>
    </div>
  );
}
