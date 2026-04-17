/**
 * Icon – renderar en Material Symbols Outlined-ikon.
 *
 * Användning:
 *   <Icon name="arrow_back" />
 *   <Icon name="check" size="sm" />
 *   <Icon name="circle" className="icon-critical" />
 *
 * Storlekar: "sm" (16px) | "md" (20px, default) | "lg" (24px) | "xl" (32px)
 */
export default function Icon({ name, size, className = '', label, ...props }) {
  const sizeClass = size === 'sm' ? ' icon-sm'
                  : size === 'lg' ? ' icon-lg'
                  : size === 'xl' ? ' icon-xl'
                  : ''

  return (
    <span
      className={`icon${sizeClass}${className ? ` ${className}` : ''}`}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...props}
    >
      {name}
    </span>
  )
}
