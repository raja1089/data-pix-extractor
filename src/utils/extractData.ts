
import Tesseract from 'tesseract.js';

// Define all possible field headers that can be extracted
export const FIELD_HEADERS = [
  'IMAGE NAME',
  'EMAIL ADDRESS',
  'STATE_1',
  'COUNTRY_1',
  'HEIGHT',
  'BILLER NAME',
  'STATE_2',
  'FIN_NO2',
  'PAST SURG',
  'POLICY NO',
  'NAME_P_HOLDER',
  'DOB',
  'MEDICINE',
  'PILL RATE',
  'TOTAL AMT',
  'RECORD NO',
  'RES_ADDRESS',
  'ZIP_1',
  'SEX_1',
  'WEIGHT',
  'SHIPPER NAME',
  'ZIP_2',
  'ALCOHOLIC',
  'DIABETIC',
  'D.LIFE ASSURE',
  'SEX_2',
  'DOSAGE',
  'COST',
  'REMARK',
  'CUSTOMER NAME',
  'CITY_1',
  'FIN_NO1',
  'D_BIRTH',
  'BLOOD GP',
  'CITY_2',
  'COUNTRY_2',
  'SMOKER',
  'ALLERGIES',
  'P_INST',
  'STH CODE',
  'CARD NAME',
  'TABLETS',
  'SHIPPING COST'
];

export interface ExtractedField {
  key: string;
  value: string | null;
}

export interface ExtractedRecord {
  id: number;
  fields: Record<string, string | null>;
}

// Function to check if a line contains a header
const containsHeader = (line: string): string | null => {
  for (const header of FIELD_HEADERS) {
    // Check if the line contains the header (case insensitive)
    if (line.toUpperCase().includes(header)) {
      return header;
    }
  }
  return null;
};

// Function to extract structured data from OCR text
const parseOCRText = (text: string): ExtractedRecord[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const records: ExtractedRecord[] = [];
  
  let currentRecord: Record<string, string | null> = {};
  let currentHeader: string | null = null;
  
  // Process each line of OCR text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line contains a header
    const header = containsHeader(line);
    
    if (header) {
      currentHeader = header;
      // Extract value after header
      const headerIndex = line.toUpperCase().indexOf(header);
      const valueAfterHeader = line.substring(headerIndex + header.length).trim();
      
      if (valueAfterHeader && valueAfterHeader.length > 0) {
        // If there's text after the header on the same line
        currentRecord[currentHeader] = valueAfterHeader.replace(/^[:\s]+/, '');
      } else if (i + 1 < lines.length) {
        // If value is on the next line
        currentRecord[currentHeader] = lines[i + 1].trim();
        i++; // Skip the next line as we've already processed it
      } else {
        currentRecord[currentHeader] = null;
      }
    } else if (currentHeader && !currentRecord[currentHeader]) {
      // This might be a value for the previous header if it was empty
      currentRecord[currentHeader] = line;
    } else if (Object.keys(currentRecord).length > 0 && line.match(/^[-]{3,}$|^[=]{3,}$/)) {
      // If we encounter a separator line and we have data, create a new record
      records.push({
        id: records.length + 1,
        fields: { ...currentRecord }
      });
      currentRecord = {};
    }
  }
  
  // Add the last record if there's data
  if (Object.keys(currentRecord).length > 0) {
    records.push({
      id: records.length + 1,
      fields: { ...currentRecord }
    });
  }
  
  // If no records were created but we have data, create a single record
  if (records.length === 0 && Object.keys(currentRecord).length > 0) {
    records.push({
      id: 1,
      fields: { ...currentRecord }
    });
  }
  
  return records;
};

// Function to perform OCR on an image and extract structured data
export const extractDataFromImage = async (
  imageFile: File
): Promise<ExtractedRecord[]> => {
  try {
    console.log('Starting OCR processing on image:', imageFile.name);
    
    // Perform OCR using Tesseract.js
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // English language
      {
        logger: m => console.log('OCR progress:', m),
      }
    );
    
    console.log('OCR completed. Raw text:', result.data.text);
    
    // Extract structured data from OCR text
    const records = parseOCRText(result.data.text);
    
    console.log('Extracted records:', records);
    
    return records;
  } catch (error) {
    console.error('Error during OCR processing:', error);
    throw new Error('Failed to extract data from image');
  }
};

// Function to export data to Excel
export const exportToExcel = (data: ExtractedRecord[]): void => {
  // Create CSV content
  const headers = FIELD_HEADERS;
  const csvContent = [
    headers.join(','),
    ...data.map(record => {
      return headers.map(header => {
        const value = record.fields[header] || '';
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',');
    })
  ].join('\n');
  
  // Create a Blob from the CSV String
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'extracted_data.csv');
  link.style.display = 'none';
  
  // Add link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
