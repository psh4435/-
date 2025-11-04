
import React from 'react';
import type { GeneratedImage } from '../types.ts';
import { ImageCard } from './ImageCard.tsx';

interface GeneratedImageGridProps {
    images: GeneratedImage[];
    isLoading: boolean;
    onImageSelect: (image: GeneratedImage) => void;
    selectedImageId: string | null;
}

const SkeletonLoader: React.FC = () => (
    <div className="aspect-square bg-gray-800 rounded-lg animate-pulse"></div>
);

export const GeneratedImageGrid: React.FC<GeneratedImageGridProps> = ({ images, isLoading, onImageSelect, selectedImageId }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonLoader key={index} />
                ))}
            </div>
        );
    }

    if (images.length === 0) {
        return (
             <div className="min-h-[200px] w-full bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                <p className="text-gray-500">AI가 생성한 이미지 컨셉이 여기에 표시됩니다.</p>
                <p className="text-sm text-gray-600">먼저 제품 사진을 업로드하고 '생성' 버튼을 클릭하세요.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
                <ImageCard 
                    key={image.id} 
                    image={image}
                    onClick={() => onImageSelect(image)}
                    isSelected={selectedImageId === image.id}
                />
            ))}
        </div>
    );
};
