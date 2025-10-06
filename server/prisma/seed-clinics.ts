import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportProgress {
  total: number;
  current: number;
  success: number;
  errors: number;
}

function reportProgress(progress: ImportProgress): void {
  const percentage = ((progress.current / progress.total) * 100).toFixed(1);
  console.log(
    `Progress: ${progress.current}/${progress.total} (${percentage}%) - Success: ${progress.success}, Errors: ${progress.errors}`,
  );
}

function getCellText(cell: ExcelJS.Cell): string {
  if (!cell.value) return '';
  if (typeof cell.value === 'string') return cell.value.trim();
  if (typeof cell.value === 'number') return cell.value.toString().trim();
  if (typeof cell.value === 'boolean') return cell.value.toString().trim();
  // Handle complex objects or formulas by trying to get their result
  if (typeof cell.value === 'object' && 'result' in cell.value) {
    return getCellText({ value: (cell.value as any).result } as ExcelJS.Cell);
  }
  return '';
}

async function main() {
  try {
    const filePath = path.resolve(__dirname, 'partner clinic .xlsx');

    console.log('Reading Excel file...');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheets found in Excel file');
    }

    console.log(
      'Available worksheets:',
      workbook.worksheets.map((ws, index) => `Sheet${index + 1}`).join(', '),
    );

    // Initialize array for rows
    const clinics: Array<{
      hospitalName: string;
      state: string;
      lga: string;
      address: string;
    }> = [];
    // Process each row
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const hospitalName = getCellText(row.getCell(1));
      const state = getCellText(row.getCell(2));
      const lga = getCellText(row.getCell(3));
      const address = getCellText(row.getCell(4));

      if (hospitalName && state && lga) {
        clinics.push({
          hospitalName,
          state,
          lga,
          address: address || '',
        });
      }
    });

    console.log(`Found ${clinics.length} clinics to import`);

    if (clinics.length > 0) {
      console.log('Sample data:', clinics[0]);
    }

    // Import progress tracking
    const progress = {
      total: clinics.length,
      current: 0,
      success: 0,
      errors: 0,
    };

    // Import the data
    for (const [index, clinic] of clinics.entries()) {
      try {
        await prisma.clinicLocation.create({
          data: {
            clinic_name: clinic.hospitalName,
            state: clinic.state,
            lga: clinic.lga,
            address: clinic.address,
            services_offered: [],
            fpm_methods_available: [],
          },
        });
        progress.success++;
        console.log(
          `Row ${index + 1}: Created clinic "${clinic.hospitalName}"`,
        );
      } catch (error) {
        progress.errors++;
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Row ${index + 1} failed:`, message);
      }

      progress.current++;
      if (progress.current % 10 === 0) {
        reportProgress(progress);
      }
    }

    console.log('\nImport completed:');
    console.log(`Success: ${progress.success} clinics`);
    console.log(`Errors: ${progress.errors} clinics`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
