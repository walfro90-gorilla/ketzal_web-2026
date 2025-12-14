'use client';

import { X } from 'lucide-react';

interface VideoPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    description?: string;
}

export default function VideoPreviewModal({
    isOpen,
    onClose,
    videoUrl,
    description
}: VideoPreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-white/10 absolute top-0 left-0 right-0 z-10 backdrop-blur-md">
                    <h3 className="text-white font-medium truncate pr-4 max-w-[80%]">
                        {description || 'Video Preview'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center p-0 md:p-10 pt-16">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}
