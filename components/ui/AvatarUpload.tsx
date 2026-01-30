'use client';

import { useState, useRef } from 'react';
import { Upload, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUpload: (url: string) => void;
    userId: string;
}

export function AvatarUpload({ currentAvatar, onUpload, userId }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentAvatar || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);

            // Upload to server
            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setPreview(result.url);
                onUpload(result.url);
            } else {
                alert('Failed to upload avatar');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-8">
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--bg-input)] flex items-center justify-center border-4 border-[var(--bg-card)] shadow-lg">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-16 h-16 text-[var(--text-secondary)]" />
                    )}
                </div>
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Upload Profile Picture</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    JPG, PNG or GIF. Max size 5MB.
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                </button>
            </div>
        </div>
    );
}
