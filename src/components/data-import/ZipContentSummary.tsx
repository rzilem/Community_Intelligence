import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ZipAnalysisResult, ZipFileEntry } from '@/services/import-export/zip-parser-service';

interface ZipContentSummaryProps {
  summary: ZipAnalysisResult;
}

export const ZipContentSummary: React.FC<ZipContentSummaryProps> = ({ summary }) => {
  const files = summary.files || [];
  const fileTypes = summary.fileTypes || {};
  const suggested = summary.suggestedAssociations || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ZIP Content Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Files</p>
            <p className="text-lg font-medium">{files.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total rows detected</p>
            <p className="text-lg font-medium">{summary.totalRecords}</p>
          </div>
        </div>

        {Object.keys(fileTypes).length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">By type</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(fileTypes).map(([type, count]) => (
                <Badge key={type} variant="secondary">{type}: {count}</Badge>
              ))}
            </div>
          </div>
        )}

        {suggested.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Suggested associations</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Files detected</p>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {files.map((f: ZipFileEntry, idx: number) => (
              <div key={idx} className="border rounded-md p-2 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium" title={f.path || f.filename}>{f.filename}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.path}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    {f.ocrSummary && <Badge variant="outline">OCR</Badge>}
                    <Badge variant="secondary">{f.detectedType}</Badge>
                    <Badge variant="outline">rows: {f.data?.length || 0}</Badge>
                    <Badge variant="outline">conf: {Math.round((f.confidence || 0) * 100)}%</Badge>
                  </div>
                </div>
                {f.ocrSummary && (
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">pages: {f.ocrSummary.pageCount}</span>
                    <span className="block truncate" title={f.ocrSummary.textPreview}>“{f.ocrSummary.textPreview}”</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
