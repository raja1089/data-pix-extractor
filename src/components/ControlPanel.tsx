
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, RefreshCw, Settings, HelpCircle } from 'lucide-react';
import { ExtractedData } from './DataTable';

interface ControlPanelProps {
  data: ExtractedData[];
  onExport: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  data, 
  onExport, 
  onReset 
}) => {
  const hasData = data.length > 0;
  
  return (
    <Card className="p-4">
      <Tabs defaultValue="actions">
        <TabsList className="mb-4">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={onExport} 
              disabled={!hasData}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export to Excel
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 pt-2">
            {hasData ? (
              <p>Ready to export {data.length} record(s)</p>
            ) : (
              <p>Upload an image to extract data</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">OCR Settings</h3>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Using Tesseract.js for real OCR text extraction. The system automatically identifies various data formats and structures from different image types.</p>
              <p className="mt-2">For best results:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Use high-resolution images with good lighting</li>
                <li>Ensure text is clearly visible and not skewed</li>
                <li>Images should have good contrast between text and background</li>
                <li>Tables, forms, and well-structured data work best</li>
                <li>Try cropping the image to focus on the data area if extraction fails</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="help">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">How to Use</h3>
            </div>
            
            <ol className="text-sm text-gray-500 space-y-2 list-decimal pl-5">
              <li>Upload an image containing structured data</li>
              <li>Wait for the OCR processing to complete (this may take a few moments)</li>
              <li>The system will attempt to identify records and fields automatically</li>
              <li>Common data structures include:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Numbered entries (like "1. John Smith...")</li>
                  <li>Form data with clear field labels</li>
                  <li>Tabular data with rows and columns</li>
                </ul>
              </li>
              <li>Review the extracted data in the table</li>
              <li>If no data is extracted, try with a clearer image or different format</li>
              <li>Click "Export to Excel" to download the data as a CSV file</li>
              <li>Use "Reset" to clear the current data and start again</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ControlPanel;
