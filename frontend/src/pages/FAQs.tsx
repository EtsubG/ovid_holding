import { HelpCircle, Mail, MessageCircle, FileText, User, Send } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

const faqs = [
  { q: 'How do I apply for a position at Ovid?', a: 'Browse our Vacancies page, find a role that fits your profile, and click "Apply Now" to start the multi-step application form. You\'ll need your CV, cover letter, and relevant documents ready.' },
  { q: 'Can I apply for multiple positions at once?', a: 'Yes, you can apply for multiple roles. Each application is reviewed independently by the relevant hiring team. We recommend tailoring your cover letter to each role.' },
  { q: 'What happens after I submit my application?', a: 'You\'ll receive a unique application reference number immediately. Our HR team reviews applications within 5-7 business days. If shortlisted, you\'ll be contacted for an initial screening call.' },
  { q: 'What is the talent pool and how does it work?', a: 'If no current vacancy matches your profile, you can submit your CV to our talent pool. Your profile becomes visible to our HR team across all companies. When a matching role opens, we\'ll reach out directly.' },
  { q: 'Do you offer internships and graduate programs?', a: 'Yes! We run structured graduate programs, summer internships, and apprenticeships. Visit our Internships page for details on eligibility and how to apply.' },
  { q: 'What documents do I need to apply?', a: 'Typically: your CV/resume, a cover letter, academic certificates, and experience letters. Specific requirements are listed on each vacancy page in the "Required Documents Checklist" box.' },
  { q: 'Can I update my application after submitting?', a: 'Once submitted, you cannot edit your application directly. However, you can email our HR team at careers@ovidholding.com with your reference number and the updated information.' },
  { q: 'Does Ovid sponsor work visas?', a: 'Yes, for selected candidates who require relocation, we provide visa sponsorship and relocation assistance as part of the offer package. This is discussed during the final interview stages.' },
  { q: 'What is the typical recruitment timeline?', a: 'From application to offer, the process typically takes 4-6 weeks, depending on the role. It includes initial screening, technical/behavioral interviews, reference checks, and a final offer.' },
  { q: 'How can I track my application status?', a: 'Use your application reference number to inquire about your status by contacting our HR team. We also proactively notify candidates at each stage of the process via email.' },
];

export function FAQs() {
  const { navigate } = useApp();

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you within 48 hours.');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Badge className="mb-4 bg-accent/10 text-accent-foreground border border-accent/30">
          <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Support
        </Badge>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Everything you need to know about applying to Ovid and our recruitment process.
        </p>
      </div>

      <Card className="mb-10 p-6 sm:p-8">
        <Accordion type="single" collapsible className="space-y-1">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left font-serif text-base font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Still have questions */}
      <Card className="border-0 bg-primary p-8 text-center text-primary-foreground">
        <MessageCircle className="mx-auto mb-3 h-8 w-8 text-accent" />
        <h2 className="font-serif text-2xl font-semibold">Still have questions?</h2>
        <p className="mx-auto mt-2 max-w-md text-primary-foreground/70">
          Our HR team is here to help. Send us a message and we'll respond within 48 hours.
        </p>
        <form onSubmit={handleContact} className="mx-auto mt-6 max-w-md space-y-3 text-left">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-primary-foreground/80">Name</Label>
              <Input required placeholder="Your name" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40" />
            </div>
            <div>
              <Label className="mb-1.5 block text-primary-foreground/80">Email</Label>
              <Input type="email" required placeholder="Your email" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-primary-foreground/80">Message</Label>
            <Textarea required placeholder="Your question..." className="min-h-[80px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40" />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="mr-2 h-4 w-4" /> Send Message
          </Button>
        </form>
      </Card>
    </div>
  );
}
