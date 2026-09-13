import { GraduationCap, Rocket, Users, BookOpen, Award, ArrowRight, Lightbulb, Target } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Internships() {
  const { navigate } = useApp();

  const programs = [
    {
      icon: Rocket,
      title: 'Graduate Program',
      duration: '24 months',
      desc: 'A structured rotational program for fresh graduates, offering exposure across multiple Ovid companies and functions.',
      spots: '12 positions',
      eligibility: 'Recent graduates (within 2 years) with a Bachelor\'s or Master\'s degree, minimum GPA 3.0',
    },
    {
      icon: BookOpen,
      title: 'Summer Internship',
      duration: '8-12 weeks',
      desc: 'Hands-on summer internships for university students, providing real project experience and mentorship.',
      spots: '30 positions',
      eligibility: 'Penultimate or final-year university students, all disciplines welcome',
    },
    {
      icon: Lightbulb,
      title: 'Apprenticeship Program',
      duration: '6-12 months',
      desc: 'Practical, skills-focused apprenticeships in construction, hospitality, and retail operations.',
      spots: '20 positions',
      eligibility: 'Diploma holders or vocational training graduates aged 18-28',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground sm:p-12">
        <Badge className="mb-4 bg-accent/20 text-accent-foreground border border-accent/30">
          <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Early Careers
        </Badge>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Start your career journey with Ovid
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/75">
          We invest in the next generation of talent through structured graduate programs, internships, and apprenticeships across all our companies.
        </p>
      </div>

      {/* Programs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.title} className="flex flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <p.icon className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{p.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Availability:</span>
                <span className="font-medium">{p.spots}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Eligibility</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.eligibility}</p>
            </div>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => navigate('talent-pool')}
            >
              Apply Now <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Why join */}
      <Card className="mt-12 border-0 bg-secondary/40 p-8">
        <h2 className="mb-6 font-serif text-2xl font-semibold">What you'll gain</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, title: 'Mentorship', desc: '1-on-1 guidance from senior leaders across the group.' },
            { icon: Rocket, title: 'Real Projects', desc: 'Work on meaningful projects that impact real business outcomes.' },
            { icon: Users, title: 'Networking', desc: 'Connect with peers and leaders across all six companies.' },
            { icon: Target, title: 'Career Path', desc: 'Top performers receive full-time offer consideration.' },
          ].map((item) => (
            <div key={item.title}>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
