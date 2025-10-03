import { useEffect, useRef, useState } from "react";

interface ChatMessage {
    sender: "user" | "server";
    text: string;
}

function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // left as exercise for the reader
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || isConnected) return;

        setMessages((prev) => [...prev, { sender: "user", text: input }]);

        setIsConnected(true);

        const es = new EventSource(`http://localhost:9090/v1/agent/talk?prompt=${encodeURIComponent(input)}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            // left as exercise for the reader
        };

        es.onerror = (err) => {
            // left as exercise for the reader
        };

        es.onopen = () => setError(null);

        setInput("");
    };

    useEffect(() => {
        // left as exercise for the reader
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Live AI Chat</h1>

            <div
                ref={chatContainerRef}
                className="bg-white shadow-md rounded-lg p-4 w-full max-w-2xl h-[500px] overflow-y-auto flex flex-col space-y-2"
            >
                {messages.length === 0 && (
                    <div className="text-gray-400 text-left">Type a message to start the chat...</div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[70%] break-words ${
                            msg.sender === "user"
                                ? "bg-blue-500 text-white self-end"
                                : "bg-gray-200 text-black self-start"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-2xl mt-4 flex">
                <input
                    type="text"
                    className="flex-1 p-2 rounded-l-md border border-gray-300 focus:outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                    disabled={isConnected}
                    placeholder={isConnected ? "Waiting for server..." : "Type a message..."}
                />
                <button
                    onClick={sendMessage}
                    className={`px-4 py-2 rounded-r-md text-white ${
                        isConnected ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                    disabled={isConnected}
                >
                    Send
                </button>
            </div>

            {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
    );
}

export default ChatScreen;
