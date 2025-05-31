// src/components/shared/FileUploader.tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useState } from 'react';

export default function FileUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.uid) return;

        // تعطيل رفع الصور مؤقتاً
        if (file.type.startsWith('image/')) {
            console.log('رفع الصور معطل مؤقتاً');
            return;
        }

        try {
            setIsUploading(true);
            // هنا يمكن إضافة كود رفع الفيديو لاحقاً
            console.log('سيتم إضافة خاصية رفع الفيديو قريباً');
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg">
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                accept="video/*"
                disabled={isUploading}
            />
            <Button
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isUploading}
            >
                {isUploading ? 'جاري الرفع...' : 'اختر فيديو'}
            </Button>
        </div>
    );
}