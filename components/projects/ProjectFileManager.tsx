'use client';

import { useState, useEffect } from 'react';
import {
    File,
    Upload,
    Download,
    Trash2,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Plus,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProjectFile {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    size_bytes: number;
    category: string;
    created_at: string;
    uploader: { name: string };
}

export default function ProjectFileManager({ projectId }: { projectId: string }) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files`);
            const data = await res.json();
            if (data.success) setFiles(data.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // In a real app, we would upload to Supabase Storage here first.
        // For this demo/implementation, we'll simulate the storage URL 
        // but save the metadata to the DB.

        const mockUrl = `https://storage.nexus-agency.com/projects/${projectId}/${file.name}`;

        try {
            const res = await fetch(`/api/projects/${projectId}/files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_name: file.name,
                    file_url: mockUrl,
                    file_type: file.type,
                    size_bytes: file.size,
                    category: 'document'
                })
            });

            if (res.ok) fetchFiles();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        return <File className="w-5 h-5 text-blue-500" />;
    };

    return (
        <Card className="p-6 border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Project Files</h3>
                    <p className="text-sm text-gray-500">Documents, mockups, and deliverables.</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer font-medium text-sm shadow-sm"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Upload
                    </label>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="py-8 text-center text-gray-400">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        <Upload className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No files uploaded yet</p>
                    </div>
                ) : (
                    files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition">
                                    {getFileIcon(file.file_type)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.file_name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {formatSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
