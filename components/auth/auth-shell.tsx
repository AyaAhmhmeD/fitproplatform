import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { Link } from "@/i18n/navigation";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(143,239,34,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(242,205,122,0.25), transparent 45%)",
          }}
        />
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-400 font-display text-lg font-bold text-ink-950">
            F
          </span>
          <span className="font-display text-lg font-semibold">FitPro</span>
        </Link>
        <div className="relative z-10">
          <h2 className="max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
            Your body. Engineered.
          </h2>
          <p className="mt-4 max-w-sm text-ink-300">
            AI-powered nutrition and training plans, real coaches, and a dashboard that actually feels premium.
          </p>
        </div>
        <p className="relative z-10 text-sm text-ink-400">© {new Date().getFullYear()} FitPro. All rights reserved.</p>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 font-display text-sm font-bold text-ink-950">
              F
            </span>
            <span className="font-display font-semibold">FitPro</span>
          </Link>
          <div className="ms-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-ink-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
