
import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>© {year} Data Pix Extractor. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-medical-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-medical-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-medical-600 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
