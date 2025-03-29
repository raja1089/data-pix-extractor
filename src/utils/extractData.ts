
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

// Parse a line of OCR text to identify potential record number prefix
const extractRecordNumber = (line: string): number | null => {
  const match = line.match(/^\s*(\d+)\s/);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num)) {
      return num;
    }
  }
  return null;
};

// Advanced parsing for structured data in OCR text
const parseOCRText = (text: string): ExtractedRecord[] => {
  console.log("Starting to parse OCR text");
  
  // Split by lines and remove empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  console.log(`Found ${lines.length} non-empty lines`);
  
  if (lines.length === 0) {
    return [];
  }
  
  const records: ExtractedRecord[] = [];
  let currentRecord: Record<string, string | null> = {};
  let currentRecordId = 0;
  
  // First pass: identify record boundaries by looking for numeric prefixes
  // This handles formats like "1 Name Email..." at the start of records
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const recordNumber = extractRecordNumber(line);
    
    // If we found a new record number and it's different from the current one
    if (recordNumber !== null && recordNumber !== currentRecordId) {
      // Save previous record if it exists
      if (currentRecordId > 0 && Object.keys(currentRecord).length > 0) {
        records.push({
          id: currentRecordId,
          fields: { ...currentRecord }
        });
        
        // Reset for new record
        currentRecord = {};
      }
      
      currentRecordId = recordNumber;
      console.log(`Found record ${currentRecordId}`);
      
      // Extract email from this line as it often appears on the same line as the record number
      const emailMatch = line.match(/\S+@\S+\.\S+/);
      if (emailMatch) {
        currentRecord['EMAIL ADDRESS'] = emailMatch[0];
        console.log(`Found email: ${emailMatch[0]}`);
      }
      
      // Look for gender/sex information
      if (line.includes('MALE') || line.includes('male')) {
        currentRecord['SEX_1'] = line.includes('FE') || line.includes('fe') ? 'FEMALE' : 'MALE';
        console.log(`Found gender: ${currentRecord['SEX_1']}`);
      }
      
      // Extract address components
      const cityStateMatch = line.match(/([A-Za-z\s]+)[,\s]+([A-Z]{2})\s+(\d{5})/);
      if (cityStateMatch) {
        currentRecord['CITY_1'] = cityStateMatch[1].trim();
        currentRecord['STATE_1'] = cityStateMatch[2];
        currentRecord['ZIP_1'] = cityStateMatch[3];
        console.log(`Found city/state/zip: ${cityStateMatch[1]} ${cityStateMatch[2]} ${cityStateMatch[3]}`);
      }
      
      // Try to find country
      if (line.includes('US') && line.length < 10) {
        currentRecord['COUNTRY_1'] = 'US';
      }
    } 
    else {
      // Not a new record, but we're inside an existing one
      if (currentRecordId > 0) {
        // Check for email if not already found
        if (!currentRecord['EMAIL ADDRESS'] && isLikelyEmail(line)) {
          currentRecord['EMAIL ADDRESS'] = line.match(/\S+@\S+\.\S+/)?.[0] || null;
        }
        
        // Check for gender/sex
        if (!currentRecord['SEX_1'] && (line.includes('MALE') || line.includes('male'))) {
          currentRecord['SEX_1'] = line.includes('FE') || line.includes('fe') ? 'FEMALE' : 'MALE';
        }
        
        // Check for dates - could be DOB
        if (isLikelyDate(line) && !line.includes('@')) {
          if (!currentRecord['DOB']) {
            currentRecord['DOB'] = line.trim();
          }
        }
        
        // Check for height and weight which often appear together
        const heightWeightMatch = line.match(/(\d{2,3})\s+(\d{2,3})/);
        if (heightWeightMatch && !currentRecord['HEIGHT'] && !currentRecord['WEIGHT']) {
          currentRecord['HEIGHT'] = heightWeightMatch[1];
          currentRecord['WEIGHT'] = heightWeightMatch[2];
        }
        
        // Check for blood group
        const bloodTypeMatch = line.match(/([ABO][\+-])/);
        if (bloodTypeMatch && !currentRecord['BLOOD GP']) {
          currentRecord['BLOOD GP'] = bloodTypeMatch[0];
        }
        
        // Check for YES/NO fields like ALCOHOLIC, DIABETIC, SMOKER
        if (/^(YES|NO)$/i.test(line.trim())) {
          const yesNoValue = line.trim().toUpperCase();
          // Since we don't know which field this belongs to, 
          // we'll check if we already have values for these fields
          if (!currentRecord['ALCOHOLIC']) {
            currentRecord['ALCOHOLIC'] = yesNoValue;
          } else if (!currentRecord['DIABETIC']) {
            currentRecord['DIABETIC'] = yesNoValue;
          } else if (!currentRecord['SMOKER']) {
            currentRecord['SMOKER'] = yesNoValue;
          }
        }
        
        // Check for dollar amounts
        const costMatch = line.match(/\$\s*(\d+(\.\d+)?)/);
        if (costMatch) {
          if (line.includes('TOTAL') || line.includes('total')) {
            currentRecord['TOTAL AMT'] = costMatch[0];
          } else if (!currentRecord['COST']) {
            currentRecord['COST'] = costMatch[0];
          }
        }
        
        // Check for medication names
        const medicationKeywords = ['XANAX', 'VALIUM', 'PHENTERMINE', 'DIDREX'];
        for (const med of medicationKeywords) {
          if (line.includes(med) && !currentRecord['MEDICINE']) {
            currentRecord['MEDICINE'] = line.trim();
            
            // Try to extract dosage which often follows medication name
            const dosageMatch = line.match(/\d+\s*MG/i);
            if (dosageMatch && !currentRecord['DOSAGE']) {
              currentRecord['DOSAGE'] = dosageMatch[0];
            }
            
            // Try to extract tablet count which often follows dosage
            const tabletMatch = line.match(/\d+(?=\s|$)/);
            if (tabletMatch && !currentRecord['TABLETS']) {
              currentRecord['TABLETS'] = tabletMatch[0];
            }
          }
        }
        
        // Check for payment methods
        const paymentMethods = ['Visa', 'Master Card', 'Discover', 'American Express', 'Bank'];
        for (const method of paymentMethods) {
          if (line.includes(method) && !currentRecord['CARD NAME']) {
            currentRecord['CARD NAME'] = method;
          }
        }
      }
    }
  }
  
  // Add the last record if it exists
  if (currentRecordId > 0 && Object.keys(currentRecord).length > 0) {
    records.push({
      id: currentRecordId,
      fields: { ...currentRecord }
    });
  }
  
  // If no records with numbers were found, try an alternative approach
  if (records.length === 0) {
    console.log("No numbered records found, trying alternative parsing");
    
    // Look for lines with email addresses as potential record separators
    let recordStartLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (isLikelyEmail(lines[i])) {
        recordStartLines.push(i);
      }
    }
    
    // If we found potential record starts
    if (recordStartLines.length > 0) {
      for (let i = 0; i < recordStartLines.length; i++) {
        const startIdx = recordStartLines[i];
        const endIdx = i < recordStartLines.length - 1 ? recordStartLines[i + 1] : lines.length;
        
        const recordLines = lines.slice(startIdx, endIdx);
        const recordFields: Record<string, string | null> = {};
        
        // Process each line in this potential record
        for (const line of recordLines) {
          if (isLikelyEmail(line)) {
            recordFields['EMAIL ADDRESS'] = line.match(/\S+@\S+\.\S+/)?.[0] || null;
          } else if (line.includes('MALE') || line.includes('male')) {
            recordFields['SEX_1'] = line.includes('FE') || line.includes('fe') ? 'FEMALE' : 'MALE';
          } else if (isLikelyDate(line) && !line.includes('@')) {
            recordFields['DOB'] = line.trim();
          }
          
          // More field extractions similar to the above
          // ... additional parsing logic as needed
        }
        
        // Only add if we found meaningful data
        if (Object.keys(recordFields).length > 0) {
          records.push({
            id: i + 1,
            fields: recordFields
          });
        }
      }
    }
  }
  
  // If still no records, create one record with whatever we can find
  if (records.length === 0 && lines.length > 0) {
    console.log("Creating a single record from all available data");
    
    const singleRecord: Record<string, string | null> = {};
    
    for (const line of lines) {
      // Apply all our extraction logic to each line
      if (isLikelyEmail(line)) {
        singleRecord['EMAIL ADDRESS'] = line.match(/\S+@\S+\.\S+/)?.[0] || null;
      }
      
      if (line.includes('MALE') || line.includes('male')) {
        singleRecord['SEX_1'] = line.includes('FE') || line.includes('fe') ? 'FEMALE' : 'MALE';
      }
      
      // and so on for other fields...
    }
    
    if (Object.keys(singleRecord).length > 0) {
      records.push({
        id: 1,
        fields: singleRecord
      });
    }
  }
  
  console.log(`Extracted ${records.length} records with data`);
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
