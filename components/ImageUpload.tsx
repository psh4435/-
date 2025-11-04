
import React, { useRef } from 'react';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, previewUrl }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div 
            className="relative w-full aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-cyan-500 transition-colors duration-300"
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
            ) : (
                <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="mt-2 text-gray-400">
                        <span className="font-semibold text-cyan-400">클릭해서 업로드</span> 또는 드래그앤드롭
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, 또는 WEBP</p>
                </div>
            )}
        </div>
    );
};
