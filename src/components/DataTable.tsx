
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface ExtractedData {
  id: number;
  fields: Record<string, string | null>;
}

interface DataTableProps {
  data: ExtractedData[];
  headers: string[];
  isLoading: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, headers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="border rounded-md p-6 w-full">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-12 w-12 rounded-full border-4 border-t-medical-600 border-medical-200 animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Processing your image...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-md p-6 w-full">
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-sm text-gray-500">No data extracted yet.</p>
          <p className="text-xs text-gray-400 mt-1">Upload an image to extract data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md w-full data-grid">
      <ScrollArea className="h-[500px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  {headers.map((header) => (
                    <TableCell key={`${row.id}-${header}`}>
                      {row.fields[header] ? (
                        row.fields[header]
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">
                          Not found
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DataTable;
