import { Building2, Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export function Footer() {
  const { navigate, hrMode } = useApp();

  if (hrMode) return null;

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <span className="font-serif text-lg font-semibold">O</span>
              </div>
              <span className="font-serif text-lg font-semibold">Ovid Holding</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              A diversified conglomerate building excellence across real estate, hospitality, capital, construction, technology, and retail.
            </p>
            <div className="mt-5 flex gap-3">
              {[Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Home', page: 'home' },
                { label: 'Companies', page: 'companies' },
                { label: 'Vacancies', page: 'vacancies' },
                { label: 'Talent Pool', page: 'talent-pool' },
                { label: 'Internships', page: 'internships' },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent">
              Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'About Ovid', page: 'about' },
                { label: 'FAQs', page: 'faqs' },
                { label: 'Contact Us', page: 'contact' },
                { label: 'Privacy Notice', page: 'privacy' },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-accent">
              Headquarters
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>DIFC, Gate Village 4, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>+971 4 555 8800</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>careers@ovidholding.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-accent" />
                <span>6 subsidiaries across the GCC</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Ovid Holding. All rights reserved.</p>
          <p>Crafted with care for every candidate's journey.</p>
        </div>
      </div>
    </footer>
  );
}
