// src/components/shared/FileUploader.tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-provider';
import { uploadAdditionalImage } from '@/lib/utils/upload';
import { useState } from 'react';

export default function FileUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.uid) return;

        try {
            setIsUploading(true);
            // رفع الصورة إلى Supabase bucket player-uploads
            const userId = user.uid;
            const result = await uploadAdditionalImage(file, userId);
            if (result.url) {
                onUploadComplete(result.url);
            } else {
                throw new Error(result.error || 'فشل في رفع الصورة');
            }
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
                accept="image/*,video/*"
                disabled={isUploading}
            />
            <Button
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isUploading}
            >
                {isUploading ? 'جاري الرفع...' : 'اختر ملف'}
            </Button>
        </div>
    );
}