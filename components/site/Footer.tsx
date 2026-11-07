import { BRAND, FOOTER } from "@/json/site/content";
import { gsap, useGsapScope } from "@/lib/motion";
import { claimPhase } from "@/lib/three/world";
import Wordmark from "./Wordmark";

export default function Footer() {
  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    claimPhase(scope, "footer");

    gsap.fromTo(
      scope.querySelector("[data-footer-line]"),
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.8,
        ease: "expo.out",
        scrollTrigger: { trigger: scope, start: "top 90%" }
      }
    );
  }, []);

  return (
    <footer ref={scope} className="relative z-10 pb-12 pt-20">
      <span
        aria-hidden
        data-footer-line
        className="absolute inset-x-0 top-0 h-px origin-left bg-[linear-gradient(90deg,transparent,#7C3AED_35%,#A855F7_50%,#7C3AED_65%,transparent)]"
      />

      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-muted">
              {BRAND.tagline}
            </p>
            <p className="eyebrow mt-8">{FOOTER.location}</p>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3">
            {FOOTER.columns.map((column) => (
              <div key={column.title}>
                <h2 className="eyebrow">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.href.startsWith("http")
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="inline-flex min-h-6 items-center text-sm text-mist transition-colors duration-300 hover:text-violet-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink-800 pt-8">
          <p className="text-xs text-slate-muted">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <a
            href="#top"
            className="inline-flex min-h-6 items-center font-mono text-xs uppercase tracking-[0.2em] text-slate-muted transition-colors duration-300 hover:text-violet-300"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
