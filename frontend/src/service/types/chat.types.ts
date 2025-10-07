export interface ChatStreamHandlers {
    onOpen?: () => void;
    onChunk: (text: string) => void;
    onError?: (error: unknown) => void;
    onComplete?: () => void;
}

export interface ChatStreamController {
    close: () => void;
}

export interface IChatService {
    streamTalk(prompt: string, handlers: ChatStreamHandlers): ChatStreamController;
}



