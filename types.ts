
export interface SourceImage {
    data: string;
    mimeType: string;
    previewUrl: string;
}

export interface GeneratedImage {
    id: string;
    src: string;
    prompt: string;
    base64: string;
    mimeType: string;
}
