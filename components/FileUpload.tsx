'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Upload, X, Check } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    defaultValue?: string;
}

export default function FileUpload({ onUploadComplete, defaultValue }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue || null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset
        setError(null);
        setUploading(true);

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload the file
            const { error: uploadError } = await supabase.storage
                .from('service_images') // Using existing bucket
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('service_images')
                .getPublicUrl(filePath);

            setPreviewUrl(publicUrl);
            onUploadComplete(publicUrl);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setPreviewUrl(null);
        onUploadComplete('');
    };

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-xs text-green-400 flex items-center gap-1">
                        <Check size={12} /> Uploaded
                    </div>
                </div>
            ) : (
                <div className="relative border-2 border-dashed border-slate-700 rounded-lg hover:border-[#00E676] transition-colors bg-[#0A0A0A]">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 animate-spin text-[#00E676] mb-3" />
                                <p className="text-sm">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 mb-3 text-slate-500" />
                                <p className="text-sm font-medium text-slate-300">Click to upload image</p>
                                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                            </>
                        )}
                    </div>
                </div>
            )}
            {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
        </div>
    );
}
