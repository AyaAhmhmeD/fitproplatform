import { getTranslations } from "next-intl/server";
import {
  Sparkles,
  Dumbbell,
  TrendingUp,
  FileScan,
  Users2,
  Globe2,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/navbar";
import { Reveal } from "@/components/landing/reveal";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tBrand = await getTranslations("brand");

  const features = [
    { icon: Sparkles, title: t("feature1Title"), body: t("feature1Body") },
    { icon: Dumbbell, title: t("feature2Title"), body: t("feature2Body") },
    { icon: TrendingUp, title: t("feature3Title"), body: t("feature3Body") },
    { icon: FileScan, title: t("feature4Title"), body: t("feature4Body") },
    { icon: Users2, title: t("feature5Title"), body: t("feature5Body") },
    { icon: Globe2, title: t("feature6Title"), body: t("feature6Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(143,239,34,0.18), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--surface) px-4 py-1.5 text-xs font-medium text-ink-400">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              {tBrand("tagline")}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              {t("heroTitle")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-400">{t("heroSubtitle")}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                  {t("heroCtaPrimary")}
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">
                  {t("heroCtaSecondary")}
                </Button>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="glass-panel mx-auto mt-20 max-w-5xl rounded-(--radius-card) p-2">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-(--surface-muted) p-6 sm:grid-cols-4">
              {["BMI", "TDEE", "Macros", "PPL"].map((label) => (
                <div key={label} className="rounded-2xl bg-(--surface) p-5 text-center">
                  <p className="font-display text-2xl font-semibold text-brand-500">{label}</p>
                  <p className="mt-1 text-xs text-ink-400">Auto-calculated</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-4 text-ink-400">{t("featuresSubtitle")}</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05}>
                <div className="card-surface h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-400/15 text-brand-500">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-ink-400">{feature.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 pb-24">
        <Reveal className="mx-auto max-w-4xl">
          <div className="glass-panel flex flex-col items-center gap-6 rounded-(--radius-card) p-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
            <p className="max-w-lg text-ink-400">{t("ctaBody")}</p>
            <Link href="/register">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                {t("ctaButton")}
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-(--border-subtle) px-6 py-8 text-center text-sm text-ink-400">
        © {new Date().getFullYear()} {tBrand("name")}. All rights reserved.
      </footer>
    </div>
  );
}
