
# Data Pix Extractor

A React application for extracting structured data from images using OCR technology.

## Project Overview

Data Pix Extractor helps users extract structured data from images containing tables or structured text. The application uses OCR (Optical Character Recognition) to scan images and identify data that matches the specified field headers.

### Features

- Image upload via drag-and-drop or file browser
- OCR processing to extract text from images
- Data parsing to identify and categorize information
- Display of extracted data in a structured table
- Export to Excel/CSV functionality

## Field Headers

The application can extract and identify the following fields:

```
IMAGE NAME
EMAIL ADDRESS
STATE_1
COUNTRY_1
HEIGHT
BILLER NAME
STATE_2
FIN_NO2
PAST SURG
POLICY NO
NAME_P_HOLDER
DOB
MEDICINE
PILL RATE
TOTAL AMT
RECORD NO
RES_ADDRESS
ZIP_1
SEX_1
WEIGHT
SHIPPER NAME
ZIP_2
ALCOHOLIC
DIABETIC
D.LIFE ASSURE
SEX_2
DOSAGE
COST
REMARK
CUSTOMER NAME
CITY_1
FIN_NO1
D_BIRTH
BLOOD GP
CITY_2
COUNTRY_2
SMOKER
ALLERGIES
P_INST
STH CODE
CARD NAME
TABLETS
SHIPPING COST
```

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```

## Usage

1. Navigate to the application in your browser
2. Upload an image containing structured data
3. Wait for the OCR processing to complete
4. Review the extracted data in the table
5. Export to Excel if needed

## Project Structure

- `/src/components`: UI components
- `/src/utils`: Utility functions including the data extraction logic
- `/src/pages`: Page components

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OCR processing (mock implementation)

## Next Steps

- Implement real OCR processing using a service like Tesseract.js or Google Cloud Vision API
- Add more export formats
- Improve data extraction accuracy with machine learning
- Add custom field mapping
