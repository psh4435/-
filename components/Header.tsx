
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                광고소재 자동생성기
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-300">
                제품 사진 한 장만으로 AI가 광고 컨셉 이미지, 광고 카피, 최종 광고 소재까지 한번에 생성해 드립니다.
            </p>
        </header>
    );
};
