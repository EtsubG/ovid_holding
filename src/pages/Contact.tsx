import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Message sent! We\'ll respond within 48 hours.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Badge className="mb-4 bg-accent/10 text-accent-foreground border border-accent/30">
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Get in Touch
        </Badge>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Have a question about a role, your application, or working at Ovid? We're here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Head Office', lines: ['DIFC, Gate Village 4', 'Dubai, UAE'] },
            { icon: Phone, title: 'Phone', lines: ['+971 4 555 8800', 'Sun–Thu, 9am–6pm GST'] },
            { icon: Mail, title: 'Email', lines: ['careers@ovidholding.com', 'hr@ovidholding.com'] },
            { icon: Clock, title: 'Response Time', lines: ['Within 48 hours', 'Mon–Fri business days'] },
          ].map((item) => (
            <Card key={item.title} className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                {item.lines.map((l) => (
                  <p key={l} className="text-sm text-muted-foreground">{l}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <Send className="h-7 w-7" />
                </div>
                <h2 className="font-serif text-2xl font-semibold">Message Sent!</h2>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Thank you for reaching out. Our team will respond to your inquiry within 48 hours.
                </p>
                <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-xl font-semibold">Send us a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block">Full Name <span className="text-destructive">*</span></Label>
                    <Input required placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Email <span className="text-destructive">*</span></Label>
                    <Input type="email" required placeholder="jane@email.com" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Phone</Label>
                    <Input placeholder="+971 50 123 4567" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Subject</Label>
                    <Select defaultValue="general">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="application">Application Status</SelectItem>
                        <SelectItem value="careers">Careers at Ovid</SelectItem>
                        <SelectItem value="internship">Internships & Graduate Programs</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Application Reference (if applicable)</Label>
                  <Input placeholder="OVID-2026-XXXX" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Message <span className="text-destructive">*</span></Label>
                  <Textarea required placeholder="How can we help you?" className="min-h-[120px]" />
                </div>
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
