
import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  /** Current filters to apply to the export */
  filters?: Record<string, string>;
  /** Number of records that will be exported */
  count?: number;
  /** Button size */
  size?: 'sm' | 'default' | 'lg';
  /** Additional class names */
  className?: string;
}

export function ExportMenu({
  filters = {},
  count,
  size = 'default',
  className,
}: ExportMenuProps) {
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      setExporting(type);
      toast.loading(`Generating ${type === 'excel' ? 'Excel' : 'PDF'}...`, {
        id: 'export',
      });

      if (type === 'excel') {
        await api.exportCandidatesExcel(filters);
      } else {
        await api.exportCandidatesPDF(filters);
      }

      toast.success(
        `${type === 'excel' ? 'Excel' : 'PDF'} downloaded successfully`,
        { id: 'export' }
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Export failed',
        { id: 'export' }
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={exporting !== null}
          className={cn(className)}
        >
          {exporting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
              <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {count !== undefined ? `Export ${count} record${count === 1 ? '' : 's'}` : 'Export'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={exporting !== null}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Excel (.xlsx)</span>
            <span className="text-[10px] text-muted-foreground">
              Spreadsheet with all columns
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
        >
          <FileText className="mr-2 h-4 w-4 text-rose-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">PDF (.pdf)</span>
            <span className="text-[10px] text-muted-foreground">
              Printable report
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}