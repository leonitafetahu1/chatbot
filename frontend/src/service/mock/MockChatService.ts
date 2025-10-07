import type {IChatService, ChatStreamHandlers, ChatStreamController} from "@/service/types/chat.types.ts";

const API_URL = "http://localhost:9090/v1/agent/talk";

export class MockChatService implements IChatService {
    streamTalk(prompt: string, handlers: ChatStreamHandlers): ChatStreamController {
        const url = `${API_URL}?prompt=${encodeURIComponent(prompt)}`;

        // Optional artificial delay for UX parity with mocks
        const delayedOpen = setTimeout(() => {
            handlers.onOpen?.();
        }, 100);

        const es = new EventSource(url);

        es.onopen = () => {
            clearTimeout(delayedOpen);
            handlers.onOpen?.();
        };

        es.onmessage = (event) => {
            try {
                const text = typeof event.data === 'string' ? event.data : String(event.data);
                handlers.onChunk(text);
            } catch (e) {
                handlers.onError?.(e);
            }
        };

        es.onerror = (err) => {
            handlers.onError?.(err);
            es.close();
            handlers.onComplete?.();
        };

        return {
            close: () => {
                es.close();
                handlers.onComplete?.();
            }
        };
    }
}



