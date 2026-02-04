import * as React from 'react';
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Language } from '../../types';

interface FileUploadProps {
    onUpload: (file: File) => Promise<string>;
    accept?: string;
    maxSize?: number; // in MB
    label?: string;
    lang: Language;
    type?: 'image' | 'document';
    currentUrl?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    accept = 'image/*',
    maxSize = 5,
    label,
    lang,
    type = 'image',
    currentUrl
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        setSuccess(false);

        // Validate size
        if (file.size > maxSize * 1024 * 1024) {
            setError(lang === 'da' ? `Filen er for stor. Maks ${maxSize}MB.` : `File too large. Max ${maxSize}MB.`);
            return;
        }

        // Show preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }

        setIsUploading(true);
        try {
            await onUpload(file);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || (lang === 'da' ? 'Upload fejlede' : 'Upload failed'));
            setPreview(currentUrl || null);
        } finally {
            setIsUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 p-6 flex flex-col items-center justify-center gap-3 ${isDragging
                        ? 'border-nexus-accent bg-nexus-accent/5 ring-4 ring-nexus-accent/10'
                        : 'border-gray-200 hover:border-nexus-accent hover:bg-gray-50'
                    } ${error ? 'border-red-300 bg-red-50' : ''}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    accept={accept}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                        <Loader2 className="animate-spin text-nexus-accent" size={32} />
                        <p className="text-sm font-medium text-gray-600">
                            {lang === 'da' ? 'Uploader...' : 'Uploading...'}
                        </p>
                    </div>
                ) : preview && type === 'image' ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="text-white" size={32} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-nexus-accent text-white' : 'bg-gray-100 text-gray-400 group-hover:text-nexus-accent group-hover:bg-nexus-accent/10'
                            }`}>
                            {type === 'image' ? <ImageIcon size={32} /> : <FileText size={32} />}
                        </div>

                        <div className="text-center">
                            <p className="font-semibold text-gray-900">
                                {lang === 'da' ? 'Klik for at uploade' : 'Click to upload'}
                                <span className="text-gray-500 font-normal"> {lang === 'da' ? 'eller træk og slip' : 'or drag and drop'}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {accept.replace(/\*/g, '').toUpperCase()} ({lang === 'da' ? 'maks' : 'max'}. {maxSize}MB)
                            </p>
                        </div>
                    </>
                )}

                {/* Status Overlays */}
                {success && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 animate-fadeIn">
                        <CheckCircle className="text-green-500" size={40} />
                        <p className="font-bold text-green-600">{lang === 'da' ? 'Uploadet!' : 'Uploaded!'}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-shake">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
