import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePDF } from 'react-to-pdf';

interface ApprovedMinutesProps {
  markdown: string;
}

export function ApprovedMinutes({ markdown }: ApprovedMinutesProps) {
  const { toPDF, targetRef } = usePDF({
    filename: 'acta_aprobada.pdf',
    page: { 
      margin: 20,
      format: 'A4',
      orientation: 'portrait',
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1
    },
  });

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Acta Aprobada</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={targetRef} className="markdown-content pdf-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => toPDF()}>Descargar PDF</Button>
      </CardFooter>
    </Card>
  );
}