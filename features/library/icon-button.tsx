import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      className={`icon-button ${className}`.trim()}
      aria-label={label}
      data-tooltip={label}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
