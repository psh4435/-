
import React from 'react';
import type { GeneratedImage } from '../types.ts';

interface ImageCardProps {
    image: GeneratedImage;
    onClick: () => void;
    isSelected: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, isSelected }) => {
    return (
        <div
            onClick={onClick}
            className={`group relative aspect-square overflow-hidden rounded-lg shadow-xl cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-cyan-400 scale-95' : 'hover:scale-105'}`}
        >
            <img src={image.src} alt={image.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm">{image.prompt}</p>
                     <div className={`mt-2 w-full text-center text-white text-xs font-bold py-2 px-3 rounded-md ${isSelected ? 'bg-cyan-500' : 'bg-cyan-600/90'}`}>
                        {isSelected ? '선택됨' : '이 컨셉 선택하기'}
                    </div>
                </div>
            </div>
             {isSelected && (
                <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </div>
    );
};
