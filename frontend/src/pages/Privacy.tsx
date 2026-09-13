import { Shield, FileText, Lock, Eye, UserCheck, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/app-context';
import { Button } from '@/components/ui/button';

export function Privacy() {
  const { navigate } = useApp();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Badge className="mb-4 bg-accent/10 text-accent-foreground border border-accent/30">
          <Shield className="mr-1.5 h-3.5 w-3.5" /> Your Privacy
        </Badge>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold">1. Information We Collect</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When you apply for a position or join our talent pool, we collect personal details (name, contact information, nationality, identity details), academic history, employment background, and documents you upload (CV, cover letter, certificates). We also collect technical data such as your IP address and browser information when you use our portal.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold">2. How We Use Your Information</h2>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>• To evaluate your application and match you with suitable roles</li>
            <li>• To communicate with you about your application and potential opportunities</li>
            <li>• To conduct background and reference checks for shortlisted candidates</li>
            <li>• To improve our recruitment processes and candidate experience</li>
            <li>• To comply with legal and regulatory obligations</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold">3. Data Security</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We implement industry-standard security measures including encryption, access controls, and regular security audits. Your documents are stored securely and accessible only to authorized HR personnel involved in the recruitment process.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold">4. Your Rights</h2>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>• Access: You can request a copy of the personal data we hold about you</li>
            <li>• Correction: You can request correction of inaccurate or incomplete data</li>
            <li>• Deletion: You can request deletion of your data, subject to legal retention requirements</li>
            <li>• Withdrawal: You can withdraw your consent at any time by contacting us</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-semibold">5. Contact Us</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you have any questions about this privacy notice or wish to exercise your rights, please contact our Data Protection Officer at privacy@ovidholding.com or write to: DIFC, Gate Village 4, Dubai, UAE.
          </p>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('contact')}>Contact Privacy Team</Button>
        </div>
      </div>
    </div>
  );
}
