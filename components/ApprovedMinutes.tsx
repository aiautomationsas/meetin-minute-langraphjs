import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from 'react-to-print';

interface ApprovedMinutesProps {
  markdown: string;
}

export function ApprovedMinutes({ markdown }: ApprovedMinutesProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Acta_Aprobada',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Acta Aprobada</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={componentRef} className="markdown-content print-content">
          <div className="print-header">
            <h1 className="text-2xl font-bold mb-4">Acta de Reunión</h1>
          </div>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-3 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
              li: ({node, ...props}) => <li className="ml-4" {...props} />,
              table: ({node, ...props}) => <table className="border-collapse border border-gray-300 mb-4" {...props} />,
              th: ({node, ...props}) => <th className="border border-gray-300 p-2 bg-gray-100" {...props} />,
              td: ({node, ...props}) => <td className="border border-gray-300 p-2" {...props} />,
            }}
          >
            {markdown}
          </ReactMarkdown>
          <div className="print-footer">
            <p className="text-sm text-gray-500 mt-4">Documento generado automáticamente</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handlePrint}>Imprimir / Guardar PDF</Button>
      </CardFooter>
    </Card>
  );
}