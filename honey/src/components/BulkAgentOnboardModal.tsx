import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface BulkAgentData {
  firstName: string;
  lastName: string;
  email: string;
  state?: string;
  lga?: string;
  languages?: string;
  maxChats?: number;
}

export interface BulkAgentResult {
  success: BulkAgentData[];
  failed: Array<{ row: number; data: BulkAgentData; error: string }>;
}

interface BulkAgentOnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkUpload: (agents: BulkAgentData[]) => Promise<BulkAgentResult>;
}

const BulkAgentOnboardModal: React.FC<BulkAgentOnboardModalProps> = ({
  isOpen,
  onClose,
  onBulkUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkAgentResult | null>(null);
  const [preview, setPreview] = useState<BulkAgentData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const agents: BulkAgentData[] = jsonData.map((row: any) => ({
          firstName: row['First Name'] || row['firstName'] || '',
          lastName: row['Last Name'] || row['lastName'] || '',
          email: row['Email'] || row['email'] || '',
          state: row['State'] || row['state'] || undefined,
          lga: row['LGA'] || row['lga'] || undefined,
          languages: row['Languages'] || row['languages'] || undefined,
          maxChats: row['Max Chats'] || row['maxChats'] || 5,
        }));

        setPreview(agents.slice(0, 5)); // Show first 5 for preview
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          const agents: BulkAgentData[] = jsonData.map((row: any) => ({
            firstName: row['First Name'] || row['firstName'] || '',
            lastName: row['Last Name'] || row['lastName'] || '',
            email: row['Email'] || row['email'] || '',
            state: row['State'] || row['state'] || undefined,
            lga: row['LGA'] || row['lga'] || undefined,
            languages: row['Languages'] || row['languages'] || undefined,
            maxChats: row['Max Chats'] || row['maxChats'] || 5,
          }));

          const uploadResult = await onBulkUpload(agents);
          setResult(uploadResult);
        } catch (error) {
          console.error('Error processing upload:', error);
          alert('Error processing file. Please try again.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com',
        'State': 'Lagos',
        'LGA': 'Ikeja',
        'Languages': 'English, Yoruba',
        'Max Chats': 5,
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Email': 'jane.smith@example.com',
        'State': 'Abuja',
        'LGA': 'Garki',
        'Languages': 'English, Hausa',
        'Max Chats': 5,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    XLSX.writeFile(workbook, 'agent_upload_template.xlsx');
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1e1e1e]">Bulk Agent Onboarding</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {!result ? (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-2">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Download the template file below</li>
                      <li>Fill in agent details (First Name, Last Name, Email are required)</li>
                      <li>Upload the completed file (supports .xlsx, .xls, .csv)</li>
                      <li>Review and confirm the upload</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Download Template Button */}
              <button
                onClick={downloadTemplate}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Agent Data
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bulk-agent-file"
                />
                <label
                  htmlFor="bulk-agent-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#006045] hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel (.xlsx, .xls) or CSV files
                  </p>
                </label>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Preview (First 5 rows)
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Languages</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Chats</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.map((agent, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {agent.firstName} {agent.lastName}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">{agent.email}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{agent.state || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{agent.languages || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{agent.maxChats}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-4">
                {/* Success Summary */}
                {result.success.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900">
                          Successfully onboarded {result.success.length} agent{result.success.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failure Summary */}
                {result.failed.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900 mb-2">
                          Failed to onboard {result.failed.length} agent{result.failed.length !== 1 ? 's' : ''}
                        </p>
                        <div className="text-sm text-red-800 space-y-1 max-h-48 overflow-y-auto">
                          {result.failed.map((failure, index) => (
                            <div key={index} className="p-2 bg-white rounded border border-red-100">
                              <p className="font-medium">Row {failure.row}: {failure.data.email}</p>
                              <p className="text-xs">{failure.error}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {!result ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={uploading}
              >
                Reset
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Upload Agents
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Upload Another File
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkAgentOnboardModal;
