
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

// Function to normalize text for better matching
const normalizeText = (text: string): string => {
  return text.trim().toUpperCase().replace(/\s+/g, ' ');
};

// Function to check if a string might contain an email
const isLikelyEmail = (str: string): boolean => {
  return /\S+@\S+\.\S+/.test(str);
};

// Function to check if a string might contain a date
const isLikelyDate = (str: string): boolean => {
  return /\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{2,4}[-/.]\d{1,2}[-/.]\d{1,2}|(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(str);
};

// Function to check if a line contains a specific field header or is a value for a known field
const identifyField = (line: string): { header: string | null, value: string | null } => {
  // Normalize the line for better matching
  const normalizedLine = normalizeText(line);
  
  // First, check for email addresses as they are distinctive
  if (isLikelyEmail(line)) {
    return { header: 'EMAIL ADDRESS', value: line.trim() };
  }
  
  // Check for dates which might be DOB
  if (isLikelyDate(line) && !line.includes('@') && line.length < 30) {
    return { header: 'DOB', value: line.trim() };
  }
  
  // Check for numerical values that might be costs, heights, weights, etc.
  const numberMatch = line.match(/\$\s*(\d+(\.\d+)?)/);
  if (numberMatch && line.includes('$')) {
    if (line.toLowerCase().includes('total')) {
      return { header: 'TOTAL AMT', value: numberMatch[0].trim() };
    } else if (line.toLowerCase().includes('cost')) {
      return { header: 'COST', value: numberMatch[0].trim() };
    }
  }
  
  // Check for explicit headers in the line
  for (const header of FIELD_HEADERS) {
    const normalizedHeader = normalizeText(header);
    
    // If header is explicitly mentioned
    if (normalizedLine.includes(normalizedHeader)) {
      // Extract value after the header
      const parts = normalizedLine.split(normalizedHeader);
      if (parts.length > 1 && parts[1].trim()) {
        return { header, value: parts[1].trim() };
      } else {
        return { header, value: null }; // Header found but no value on same line
      }
    }
  }
  
  // Special case identification logic for common fields without explicit headers
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(line.trim())) {
    return { header: 'EMAIL ADDRESS', value: line.trim() };
  }
  
  if (/^(male|female)$/i.test(line.trim())) {
    return { header: 'SEX_1', value: line.trim() };
  }
  
  if (/^(yes|no)$/i.test(line.trim()) && line.length < 5) {
    // This could be various yes/no fields like ALCOHOLIC, DIABETIC, SMOKER
    // But we can't determine which one specifically without context
    return { header: null, value: line.trim() };
  }
  
  // Check if this line looks like an address
  if ((line.includes('St') || line.includes('Dr') || line.includes('Ave') || line.includes('Road') || line.includes('Lane')) 
      && !isLikelyEmail(line) && line.length > 10) {
    return { header: 'RES_ADDRESS', value: line.trim() };
  }
  
  // Check for city, state format
  const cityStateMatch = line.match(/([A-Za-z\s]+),?\s+([A-Z]{2})/);
  if (cityStateMatch) {
    return { header: 'CITY_1', value: cityStateMatch[1].trim() };
  }
  
  // Default: No specific field identified
  return { header: null, value: line.trim() };
};

// Function to process OCR text and identify records based on structure
const parseOCRText = (text: string): ExtractedRecord[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const records: ExtractedRecord[] = [];
  
  // Try to identify record boundaries
  // In many documents, records are separated by consistent patterns
  // like numbering, horizontal lines, or blank lines
  
  // First pass: Look for numbered entries like "1.", "2.", etc.
  const numberPrefixRegex = /^\s*(\d+)[\.\s]/;
  const possibleRecordStarts: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (numberPrefixRegex.test(lines[i])) {
      possibleRecordStarts.push(i);
    }
  }
  
  // If we found numbered entries, use them to split the records
  if (possibleRecordStarts.length > 1) {
    for (let i = 0; i < possibleRecordStarts.length; i++) {
      const start = possibleRecordStarts[i];
      const end = i < possibleRecordStarts.length - 1 ? possibleRecordStarts[i + 1] : lines.length;
      
      const recordLines = lines.slice(start, end);
      const recordFields: Record<string, string | null> = {};
      
      // Process each line in this record
      for (let j = 0; j < recordLines.length; j++) {
        const { header, value } = identifyField(recordLines[j]);
        
        if (header) {
          recordFields[header] = value;
        } else if (j > 0) {
          // This might be a continuation of the previous field
          // We don't handle this case fully, but could extend the logic
        }
      }
      
      // Only add record if we found any fields
      if (Object.keys(recordFields).length > 0) {
        records.push({
          id: records.length + 1,
          fields: recordFields
        });
      }
    }
  } else {
    // No clear record boundaries found, try to extract data anyway
    // Here we'll look for patterns that might indicate fields
    
    let currentRecord: Record<string, string | null> = {};
    let recordStarted = false;
    
    for (let i = 0; i < lines.length; i++) {
      const { header, value } = identifyField(lines[i]);
      
      // If we found a likely email address, it often indicates the start of a record
      if (header === 'EMAIL ADDRESS' && value) {
        if (recordStarted && Object.keys(currentRecord).length > 0) {
          // Save the previous record
          records.push({
            id: records.length + 1,
            fields: { ...currentRecord }
          });
          currentRecord = {};
        }
        recordStarted = true;
        currentRecord[header] = value;
      } else if (header && recordStarted) {
        currentRecord[header] = value;
      }
    }
    
    // Add the last record if there is one
    if (recordStarted && Object.keys(currentRecord).length > 0) {
      records.push({
        id: records.length + 1,
        fields: { ...currentRecord }
      });
    }
    
    // If no records were found using the above logic, try a simpler approach
    if (records.length === 0) {
      // Just gather all identifiable fields
      const allFields: Record<string, string | null> = {};
      
      for (const line of lines) {
        const { header, value } = identifyField(line);
        if (header) {
          allFields[header] = value;
        }
      }
      
      // If we found any fields, create a single record
      if (Object.keys(allFields).length > 0) {
        records.push({
          id: 1,
          fields: allFields
        });
      }
    }
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
