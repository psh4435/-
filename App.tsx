
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { ImageUpload } from './components/ImageUpload.tsx';
import { GeneratedImageGrid } from './components/GeneratedImageGrid.tsx';
import { generateConceptImage, generateAdCopy } from './services/geminiService.ts';
import { LOOK_PROMPTS } from './constants.ts';
import type { SourceImage, GeneratedImage } from './types.ts';

interface AdCopyResult {
    headlines: string[];
    bodies: string[];
}

const App: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [productInfo, setProductInfo] = useState<string>('');
    const [adCopyResult, setAdCopyResult] = useState<AdCopyResult | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCopyLoading, setIsCopyLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setSourceImage(null);
        setGeneratedImages([]);
        setSelectedImage(null);
        setAdCopyResult(null);
        setProductInfo('');
        setError(null);
    };

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('유효한 이미지 파일을 업로드해주세요.');
            return;
        }
        resetState();

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const [meta, data] = base64String.split(',');
            if (!meta || !data) {
                setError('이미지 파일을 읽을 수 없습니다. 다른 파일을 시도해주세요.');
                return;
            }
            const mimeType = meta.split(':')[1]?.split(';')[0];
            if (!mimeType) {
                setError('이미지 타입을 결정할 수 없습니다. 다른 파일을 시도해주세요.');
                return;
            }
            setSourceImage({ data, mimeType, previewUrl: base64String });
        };
        reader.onerror = () => {
            setError('선택한 파일을 읽는데 실패했습니다.');
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateConcepts = useCallback(async () => {
        if (!sourceImage) {
            setError('먼저 이미지를 업로드해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImage(null);
        setAdCopyResult(null);
        setProductInfo('');

        try {
            const imagePromises = LOOK_PROMPTS.map((prompt, index) =>
                generateConceptImage(sourceImage.data, sourceImage.mimeType, prompt.prompt)
                    .then(result => ({
                        id: `image-${index}-${Date.now()}`,
                        src: result.imageUrl,
                        prompt: prompt.title,
                        base64: result.base64,
                        mimeType: result.mimeType,
                    }))
            );

            const results = await Promise.all(imagePromises);
            setGeneratedImages(results);

        } catch (err) {
            setError(err instanceof Error ? err.message : '이미지 생성 중 알 수 없는 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage]);

    const handleImageSelect = (image: GeneratedImage) => {
        setSelectedImage(image);
        setAdCopyResult(null);
    };

    const handleGenerateCopy = useCallback(async () => {
        if (!selectedImage) {
            setError('광고 카피를 생성할 이미지를 먼저 선택해주세요.');
            return;
        }
         if (!productInfo.trim()) {
            setError('제품 정보를 입력해주세요.');
            return;
        }
        setIsCopyLoading(true);
        setError(null);
        setAdCopyResult(null);
        try {
            const copies = await generateAdCopy(selectedImage.prompt, productInfo);
            setAdCopyResult(copies);
        } catch (err) {
            setError(err instanceof Error ? err.message : '광고 카피 생성 중 알 수 없는 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsCopyLoading(false);
        }
    }, [selectedImage, productInfo]);
    
    const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };
        return (
            <button onClick={handleCopy} className="ml-2 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors">
                {copied ? '복사됨!' : '복사'}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />

                <main className="mt-12 space-y-16">
                    {/* Step 1: Upload */}
                    <section>
                        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">1. 광고할 제품 사진 업로드</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                            <div className="md:col-span-2">
                                <ImageUpload onImageSelect={handleImageUpload} previewUrl={sourceImage?.previewUrl || null} />
                            </div>
                            <div className="md:col-span-3 flex flex-col justify-center">
                                 <p className="text-gray-300 mb-6">시작하려면 제품이나 서비스의 고품질 이미지를 업로드하세요. AI가 이 이미지를 기반으로 다양한 광고 컨셉을 생성합니다.</p>
                                <button
                                    onClick={handleGenerateConcepts}
                                    disabled={!sourceImage || isLoading}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg shadow-lg transform transition-transform duration-200 ease-in-out hover:scale-105 disabled:scale-100 flex items-center justify-center text-lg"
                                >
                                    {isLoading ? (
                                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>이미지 컨셉 생성 중...</>
                                    ) : (
                                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636 6.364l.707-.707M12 21v-1m6.364-6.364l-.707-.707M6.343 6.343l-.707-.707" /></svg>AI 컨셉 이미지 4장 생성</>
                                    )}
                                </button>
                                {error && !isLoading && <p className="text-red-400 mt-4 text-center">{error}</p>}
                            </div>
                        </div>
                    </section>
                    
                    {/* Step 2: Select Concept */}
                    {(isLoading || generatedImages.length > 0) && (
                        <section>
                            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">2. 마음에 드는 광고 컨셉 선택</h2>
                            <GeneratedImageGrid images={generatedImages} isLoading={isLoading} onImageSelect={handleImageSelect} selectedImageId={selectedImage?.id} />
                        </section>
                    )}

                     {/* Step 3: Product Info & Generate Copy */}
                    {selectedImage && (
                        <section>
                             <h2 className="text-2xl font-semibold text-cyan-400 mb-4">3. 제품 정보 입력 및 광고 카피 생성</h2>
                             <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                <div className="md:col-span-2">
                                    <img src={selectedImage.src} alt="Selected concept" className="rounded-lg w-full aspect-square object-cover shadow-xl"/>
                                    <p className="text-center text-gray-400 mt-2 text-sm">선택된 컨셉: {selectedImage.prompt}</p>
                                </div>
                                <div className="md:col-span-3 flex flex-col justify-center">
                                     <p className="text-gray-300 mb-4">AI가 광고 카피를 정확하게 생성할 수 있도록 제품에 대한 정보를 입력해주세요. (예: 제품 특징, 타겟 고객, 장점 등)</p>
                                     <textarea
                                        value={productInfo}
                                        onChange={(e) => setProductInfo(e.target.value)}
                                        placeholder="예: 천연 성분으로 만든 저자극 스킨케어 앰플, 20-30대 민감성 피부 타겟, 주름 개선 기능성..."
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        rows={4}
                                    />
                                    <button
                                        onClick={handleGenerateCopy}
                                        disabled={isCopyLoading || !productInfo.trim()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg flex items-center justify-center text-lg disabled:cursor-not-allowed"
                                    >
                                        {isCopyLoading ? (
                                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>광고 카피 생성 중...</>
                                        ) : (
                                            "헤드카피 & 본문카피 생성"
                                        )}
                                    </button>
                                     {error && !isCopyLoading && <p className="text-red-400 mt-4 text-center">{error}</p>}
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Step 4: Final Creatives */}
                    {(isCopyLoading || adCopyResult) && (
                         <section>
                            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">4. 광고 소재 확인 및 활용</h2>
                            <p className="text-gray-400 mb-6">AI가 생성한 광고 소재입니다. 선택한 이미지와 생성된 카피를 조합하여 바로 광고에 활용해보세요. 카피는 우측 버튼으로 복사할 수 있습니다.</p>
                            {isCopyLoading ? (
                               <div className="text-center py-8">
                                    <svg className="animate-spin mx-auto h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-4">AI가 매력적인 카피를 만들고 있습니다...</p>
                                </div>
                            ) : adCopyResult && selectedImage && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800 p-6 rounded-lg">
                                    <div>
                                        <img src={selectedImage.src} alt="Final concept" className="rounded-lg w-full aspect-square object-cover shadow-xl"/>
                                        <p className="text-center text-gray-400 mt-2 text-sm">선택된 컨셉: {selectedImage.prompt}</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-cyan-400 mb-3">헤드카피 (Headline)</h3>
                                            <ul className="space-y-2">
                                                {adCopyResult.headlines.map((copy, index) => (
                                                    <li key={`h-${index}`} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                                        <span className="text-gray-200">{copy}</span>
                                                        <CopyButton textToCopy={copy} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-cyan-400 mb-3">본문카피 (Body)</h3>
                                            <ul className="space-y-2">
                                                {adCopyResult.bodies.map((copy, index) => (
                                                    <li key={`b-${index}`} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                                        <span className="text-gray-200">{copy}</span>
                                                        <CopyButton textToCopy={copy} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
