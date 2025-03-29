
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import DataTable, { ExtractedData } from '@/components/DataTable';
import ControlPanel from '@/components/ControlPanel';
import { FIELD_HEADERS, extractDataFromImage, exportToExcel } from '@/utils/extractData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Process the image and extract data
      const data = await extractDataFromImage(file);
      
      setExtractedData(data);
      
      toast({
        title: "Data extraction complete",
        description: `Successfully extracted data from ${file.name}`,
      });
    } catch (error) {
      console.error('Error extracting data:', error);
      toast({
        title: "Error extracting data",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (extractedData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please upload and process an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToExcel(extractedData);
      toast({
        title: "Export successful",
        description: "Your data has been exported to Excel.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setExtractedData([]);
    toast({
      title: "Reset complete",
      description: "All extracted data has been cleared.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>
                    Upload an image to extract structured data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader onImageUpload={handleImageUpload} />
                </CardContent>
              </Card>
              
              <ControlPanel 
                data={extractedData}
                onExport={handleExport}
                onReset={handleReset}
              />
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Data</CardTitle>
                  <CardDescription>
                    View and verify extracted information from your document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    data={extractedData}
                    headers={FIELD_HEADERS}
                    isLoading={isProcessing}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
