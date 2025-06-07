import Papa from 'papaparse';

export interface ParticipantData {
  name: string;
  email: string;
  rollNumber?: string;
  department?: string;
  year?: string;
}

export function parseCSV(csvContent: string): Promise<ParticipantData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize headers to match our interface
        const normalized = header.toLowerCase().trim();
        if (normalized.includes('name')) return 'name';
        if (normalized.includes('email')) return 'email';
        if (normalized.includes('roll')) return 'rollNumber';
        if (normalized.includes('department')) return 'department';
        if (normalized.includes('year')) return 'year';
        return header;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }

        const participants = results.data as ParticipantData[];
        
        // Validate required fields
        const validParticipants = participants.filter(p => p.name && p.email);
        
        if (validParticipants.length === 0) {
          reject(new Error('No valid participants found. Ensure CSV has name and email columns.'));
          return;
        }

        resolve(validParticipants);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

export function validateCSVStructure(csvContent: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV validation error: ${results.errors[0].message}`));
          return;
        }

        const headers = results.meta.fields || [];
        resolve(headers);
      },
      error: (error) => {
        reject(new Error(`CSV validation failed: ${error.message}`));
      }
    });
  });
}