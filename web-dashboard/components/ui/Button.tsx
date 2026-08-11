import Link from "next/link";

function isNativeLink(href: string) {
  return (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
  target,
  rel,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  target?: string;
  rel?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-light",
    secondary: "bg-navy text-white hover:bg-navy-light",
    ghost: "border border-slate-200 hover:bg-slate-50",
  };
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    if (isNativeLink(href)) {
      return (
        <a
          href={href}
          className={cls}
          target={target}
          rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
