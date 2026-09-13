// src/components/DocumentPreview.tsx
import { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  filename: string;
  docName: string;
}

export function DocumentPreview({ open, onClose, candidateId, filename, docName }: DocumentPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ext = docName.split('.').pop()?.toLowerCase();
  const isPDF = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png'].includes(ext || '');

  useEffect(() => {
    if (open && filename) {
      setLoading(true);
      setError(null);
      
      const url = api.getDocumentUrl(candidateId, filename);
      
      // Fetch as blob for secure preview
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load document');
          return res.blob();
        })
        .then(blob => {
          setBlobUrl(URL.createObjectURL(blob));
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [open, filename]);

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = docName;
      link.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="border-b px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-sm font-medium truncate">{docName}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={blobUrl || '#'} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> Open
              </a>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-secondary/30 p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading document...</div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" onClick={() => window.open(api.getDocumentUrl(candidateId, filename), '_blank')}>
                Try Opening in New Tab
              </Button>
            </div>
          )}
          
          {!loading && !error && blobUrl && (
            <>
              {isPDF && (
                <iframe
                  src={blobUrl}
                  className="w-full h-full rounded-lg border"
                  title={docName}
                />
              )}
              
              {isImage && (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={blobUrl}
                    alt={docName}
                    className="max-w-full max-h-full object-contain rounded-lg border"
                  />
                </div>
              )}
              
              {!isPDF && !isImage && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground mb-3">Preview not available for this file type</p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> Download to View
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}