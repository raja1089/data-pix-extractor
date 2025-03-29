
import { FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileImage className="h-8 w-8 text-medical-600" />
          <h1 className="text-2xl font-bold text-gray-900">Data Pix Extractor</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
