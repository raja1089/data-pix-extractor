
// This is a mock implementation of data extraction
// In a real application, this would use a proper OCR service

export interface ExtractedField {
  key: string;
  value: string | null;
}

export interface ExtractedRecord {
  id: number;
  fields: Record<string, string | null>;
}

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

// Mock data based on the provided image
const MOCK_DATA: ExtractedRecord[] = [
  {
    id: 1,
    fields: {
      'IMAGE NAME': 'A M Bibbs',
      'EMAIL ADDRESS': 'ambibbs@aol.com',
      'RES_ADDRESS': '2691 S Couns Dr',
      'CITY_1': 'Sacramento',
      'STATE_1': 'CA',
      'ZIP_1': '74751',
      'CUSTOMER NAME': 'A M Bibbs',
      'HEIGHT': '183',
      'WEIGHT': '185',
      'BILLER NAME': 'JOSEPH WALKER',
      'RECORD NO': '123456',
      'DOB': '09/30/1959',
      'TOTAL AMT': '$250.00',
      'SHIPPING COST': '$20.00',
      'CARD NAME': 'XANAX 2 MG'
    }
  },
  {
    id: 2,
    fields: {
      'IMAGE NAME': 'Andy Williams',
      'EMAIL ADDRESS': 'andy2922@hotmail.com',
      'RES_ADDRESS': '5180 Pinu',
      'CITY_1': 'hampton bays',
      'STATE_1': 'NY',
      'ZIP_1': '21184',
      'CUSTOMER NAME': 'Andy Williams',
      'HEIGHT': '193',
      'WEIGHT': '176',
      'BLOOD GP': 'A+',
      'ALCOHOLIC': 'NO',
      'SMOKER': 'NO',
      'DIABETIC': 'NO',
      'CARD NAME': 'SHARON S.'
    }
  },
  {
    id: 3,
    fields: {
      'IMAGE NAME': 'A Margaret Lowell',
      'EMAIL ADDRESS': 'bba53@yahoo.com',
      'RES_ADDRESS': 'Falcon Av',
      'CITY_1': 'Circleville',
      'STATE_1': 'OH',
      'ZIP_1': '75752',
      'CUSTOMER NAME': 'A Margaret Lowell',
      'DOB': 'Friday, March 09, 1962',
      'HEIGHT': '158',
      'BLOOD GP': 'O+',
      'ALCOHOLIC': 'NO',
      'SMOKER': 'YES',
      'TOTAL AMT': '$220.00',
      'SHIPPING COST': '$20.00',
      'CARD NAME': 'XANAX 2 MG'
    }
  }
];

// Function to simulate OCR and data extraction
export const extractDataFromImage = async (
  imageFile: File
): Promise<ExtractedRecord[]> => {
  // In a real application, this would send the image to an OCR service
  // For now, we'll just simulate processing time and return mock data
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      resolve(MOCK_DATA);
    }, 2000);
  });
};

// Function to export data to Excel (mock implementation)
export const exportToExcel = (data: ExtractedRecord[]): void => {
  // In a real application, this would create an Excel file
  // For now, we'll just log the data to console
  console.log('Exporting data to Excel:', data);
  
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
