import { PrismaClient } from "@prisma/client";
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const filePath = 'C:/Users/Balky/Desktop/Chatbot/Chatbot/server/prisma/partner clinic .xlsx';
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(filePath);
    

    console.log('Available sheets:', workbook.SheetNames);
    
    const sheetName = 'Partner Clinic Data';
    if (!workbook.Sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
    }

    const sheet = workbook.Sheets[sheetName];
    
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    
    console.log(`Found ${rows.length} rows to import`);
    
    
    if (rows.length > 0) {
        console.log('First row columns:', Object.keys(rows[0]));
        console.log('Sample data:', rows[0]);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [index, row] of rows.entries()) {
        try {
            const data = row;
            
            const clinicName = data['Hospital Name'] || data['Clinic Name'] || data['__EMPTY'] || 'Unknown';
            const state = data['State'] || data['__EMPTY_1'];
            const lga = data['LGA'] || data['__EMPTY_2'];
            const address = data['Address'] || data['__EMPTY_3'];
            
            if (!state || state.trim() === '') {
                console.log(`Row ${index + 1}: Skipping - State is required but missing`);
                continue;
            }

            await prisma.clinicLocation.create({
                data: {
                    clinic_name: clinicName.trim(),
                    clinic_type: data['Clinic Type'] || null,
                    state: state.trim(),
                    city: data['City'] || null,
                    lga: lga?.trim() || null,
                    address: address?.trim() || null,
                
                    phone_number: data['Phone Number']?.toString() || null,
                    email: data['Email'] || null,
                    website: data['Website'] || null,
                    services_offered: data['Services Offered']
                        ? data['Services Offered'].split(',').map((service: string) => service.trim())
                        : [],
                    fpm_methods_available: data['FPM Methods']
                        ? data['FPM Methods'].split(', ').map((method: string) => method.trim())
                        : [],
                    consultation_fee: data['Consultation Fee']
                        ? parseFloat(data['Consultation Fee'].toString())
                        : null,
                    operating_hours: data['Operating Hours'] || null,
                    latitude: data['Latitude'] ? parseFloat(data['Latitude'].toString()) : null,
                    longitude: data['Longitude'] ? parseFloat(data['Longitude'].toString()) : null
                }
            });
            successCount++;
            console.log(`Row ${index + 1}: ${data['Clinic Name'] || 'Unknown'} imported successfully`);
            
        } catch (error) {
            errorCount++;
            console.error(`Row ${index + 1} failed:`, error.message);
            console.error('Row data:', row);
        }
    }

    console.log(`\nImport completed:`);
    console.log(`Success: ${successCount} records`);
    console.log(`Errors: ${errorCount} records`);
}

main()
    .catch((e) => {
        console.error('Main function error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('Prisma connection closed');
    });