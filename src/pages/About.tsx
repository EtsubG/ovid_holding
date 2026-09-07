import { Building2, Target, Eye, Heart, Globe2, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { companies } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function About() {
  const { navigate } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge className="mb-6 bg-accent/15 text-accent-foreground border border-accent/30">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> About Us
          </Badge>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Building a legacy of excellence
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
            Ovid Holding is a diversified conglomerate with operations spanning real estate, hospitality, financial services, construction, technology, and retail across the GCC region.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            { icon: Building2, value: '6', label: 'Subsidiary Companies' },
            { icon: Users, value: '3,400+', label: 'Team Members' },
            { icon: Globe2, value: '6', label: 'Countries' },
            { icon: TrendingUp, value: '2009', label: 'Founded' },
          ].map((s) => (
            <Card key={s.label} className="p-6 text-center">
              <s.icon className="mx-auto mb-2 h-6 w-6 text-accent" />
              <div className="font-serif text-3xl font-semibold">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To deliver exceptional value across every industry we operate in, through innovation, integrity, and an unwavering commitment to quality.' },
              { icon: Eye, title: 'Our Vision', desc: 'To be the most respected diversified group in the region, recognized for the excellence of our people and the lasting impact of our projects.' },
              { icon: Heart, title: 'Our Values', desc: 'Excellence, integrity, human-centricity, and sustainable growth guide every decision we make and every relationship we build.' },
            ].map((item) => (
              <Card key={item.title} className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Companies overview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Our Portfolio</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Six companies, one standard</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Card key={c.id} className="p-6 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary font-serif font-semibold">
                  {c.shortName}
                </div>
                <span className="text-xs text-muted-foreground">{c.founded}</span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">{c.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{c.industry}</span>
                <span>·</span>
                <span>{c.location}</span>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('companies')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Explore Companies <Building2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
