interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'audio';
  url?: string;
  duration?: number;
  size?: number;
}

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  // Mock upload - simulate file upload without backend
  return new Promise((resolve) => {
    setTimeout(() => {
      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        resolve({
          success: false,
          error: 'File size exceeds 10MB limit'
        });
        return;
      }

      // Create mock URL using object URL
      const mockUrl = URL.createObjectURL(file);
      
      resolve({
        success: true,
        fileUrl: mockUrl
      });
    }, 500); // Simulate upload delay
  });
};

export const uploadMultipleFiles = async (files: AttachedFile[]): Promise<{[key: string]: UploadResponse}> => {
  const uploadPromises = files.map(async (attachment) => {
    const result = await uploadFile(attachment.file);
    return { id: attachment.id, result };
  });

  const results = await Promise.all(uploadPromises);
  
  return results.reduce((acc, { id, result }) => {
    acc[id] = result;
    return acc;
  }, {} as {[key: string]: UploadResponse});
};

export const sendMessageWithAttachments = async (
  message: string, 
  attachments: AttachedFile[] = []
): Promise<{success: boolean, error?: string}> => {
  // Mock implementation - simulate sending without backend
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Message sent:', {
        text: message,
        attachments: attachments.map(a => ({
          type: a.type,
          name: a.file.name,
          size: a.size
        }))
      });
      
      resolve({ success: true });
    }, 1000); // Simulate send delay
  });
};