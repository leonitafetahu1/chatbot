import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ServiceRegistry } from '@/service/ServiceRegistry.ts';

interface ChatMessage {
  sender: 'user' | 'server';
  text: string;
  timestamp: number;
  avatar?: string;
}

function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isConnected) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: input,
      timestamp: Date.now(),
      avatar: '🙂',
    };
    setMessages((prev) => [...prev, userMessage]);

    setError(null);
    setIsConnected(true);

    const controller = ServiceRegistry.chat.streamTalk(input, {
      onOpen: () => setError(null),
      onChunk: (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'server') {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              text: last.text + (last.text ? '\n\n' : '') + chunk,
            };
            return updated;
          }
          const serverMessage: ChatMessage = {
            sender: 'server',
            text: chunk,
            timestamp: Date.now(),
            avatar: '🤖',
          };
          return [...prev, serverMessage];
        });
      },
      onError: (_err) => {
        setIsConnected(false);
        setError('Connection error. Please retry.');
      },
      onComplete: () => {
        setIsConnected(false);
        setMessages((prev) => {
          const hasServer = prev.some((m) => m.sender === 'server');
          if (hasServer) setError(null);
          return prev;
        });
      },
    });

    eventSourceRef.current = {
      close: () => controller.close(),
    } as unknown as EventSource;

    setInput('');
  };

  const logout = () => {
    // Clear active stream and chat history, then logout
    try {
      eventSourceRef.current?.close();
    } catch {}
    setMessages([]);
    setInput('');
    setError(null);
    setIsConnected(false);
    localStorage.removeItem('user_access_token');
    navigate('/');
  };

  const resetChat = () => {
    try {
      eventSourceRef.current?.close();
    } catch {}
    setIsConnected(false);
    setError(null);
    setInput('');
    setMessages([]);
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;
    return (
      <div className='fixed inset-0 z-20 flex items-center justify-center'>
        <div
          className='absolute inset-0 bg-black/20'
          onClick={() => setShowDeleteModal(false)}
        />
        <div className='relative z-30 bg-white rounded-2xl shadow-xl w-[90%] max-w-xl p-6'>
          <div className='text-xl font-semibold text-[#2d2a24] mb-2'>
            Delete chat?
          </div>
          <div className='text-[#2d2a24] mb-4'>
            Deleting this chat will permanently erase all messages. This action
            cannot be undone.
          </div>
          <div className='flex justify-end gap-3'>
            <button
              className='px-4 py-2 rounded-full border border-[#f1eeea] text-[#2d2a24]'
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className='px-4 py-2 rounded-full text-white'
              style={{ backgroundColor: '#b23b2a' }}
              onClick={() => {
                setShowDeleteModal(false);
                resetChat();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      try {
        eventSourceRef.current?.close();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (messages.length === 0) {
    return (
      <div className='h-screen w-full overflow-hidden flex flex-col items-center justify-center px-0 '>
        {renderDeleteModal()}
        <div className='w-full fixed top-0 left-0 right-0 border-b border-[#f4efe9]'>
          <div className='mx-auto w-full max-w-4xl px-6 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-[#2d2a24]'>
              <span className='font-semibold'>AI Chat</span>
            </div>
            <div className='relative flex items-center gap-2' ref={menuRef}>
              <button
                onClick={resetChat}
                className='w-full text-left px-3 py-2 text-sm  bg-[#bab09b] text-[#ffffff]'
              >
                New chat
              </button>
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className='w-9 h-9 rounded-full hover:bg-[#f7f4ef] flex items-center justify-center text-[#2d2a24] font-semibold'
                aria-label='More menu'
              >
                ⋯
              </button>

              {isMenuOpen && (
                <div className='absolute top-full mt-2 w-40 right-0 bg-white rounded-md shadow-md border border-[#efeae1] z-10'>
                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowDeleteModal(true);
                      }}
                      className='w-full text-left px-3 py-2 text-sm hover:bg-[#f7f4ef]'
                    >
                      Delete chat
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className='w-full text-left px-3 py-2 text-sm hover:bg-[#f7f4ef]'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='w-full max-w-4xl px-6 pt-24 flex-1 flex flex-col justify-center'>
          <div className='w-full max-w-4xl'>
            <div className='text-center mb-6'>
              <div className='text-[#6e6557] text-lg'>Hi there 👋 </div>
              <div className='text-3xl md:text-5xl font-semibold tracking-tight text-[#2d2a24]'>
                What would like to know?
              </div>
              <div className='text-[#8e8576] mt-2'>
                Use one of the most common prompts below
                <br />
                or use your own to begin
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-12'>
              {[
                {
                  icon: '👤',
                  text: 'Help me to create a personal\nbranding and web page',
                  value: 'Help me create a personal branding and web page',
                },
                {
                  icon: '✉️',
                  text: 'Write a report based on my\nwebsite data',
                  value: 'Write a report based on my website data',
                },
                {
                  icon: '💡',
                  text: 'Write a tailored, engaging content,\nwith a focus quality',
                  value:
                    'Write a tailored, engaging content with a focus on quality',
                },
              ].map((c, i) => (
                <button
                  key={i}
                  className='rounded-xl text-left px-8 py-3 border  bg-[#fafaf8] hover:shadow-sm transition whitespace-pre-line text-[#2d2a24] hover:border-[#F7F4EF] focus:outline-none focus:ring-0 focus:border-[#DDD2BE]'
                  onClick={() => {
                    setInput(c.value);
                    setTimeout(() => sendMessage(), 0);
                  }}
                  disabled={isConnected}
                >
                  <span className='mr-2'>{c.icon}</span>
                  {c.text}
                </button>
              ))}
            </div>

            <div
              className='rounded-xl px-5 py-4 flex items-center gap-3 mt-5 border-[#f1eeea] border-1'
              style={{
                background: '#fff',
              }}
            >
              <span className='text-[#7b715f]'>＋</span>
              <input
                type='text'
                className='flex-1 bg-transparent outline-none text-[#2d2a24] placeholder-[#a89f8f]'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder='Ask anything'
                disabled={isConnected}
              />
              <button
                className='w-10 h-10 rounded-full text-white flex items-center justify-center'
                style={{ backgroundColor: isConnected ? '#cfc8b9' : '#bab09b' }}
                onClick={sendMessage}
                disabled={isConnected}
                aria-label='Send'
              >
                ➜
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen w-full overflow-hidden flex flex-col items-center'>
      {renderDeleteModal()}
      <div className='w-full fixed top-0 left-0 right-0 border-b border-[#f4efe9]'>
        <div className='mx-auto w-full max-w-4xl px-6 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-2 text-[#2d2a24]'>
            <span className='font-semibold'>AI Chat</span>
          </div>

          <div className='relative flex items-center gap-2' ref={menuRef}>
            <button
              onClick={resetChat}
              className='w-full text-left px-3 py-2 text-sm  bg-[#bab09b] text-[#ffffff]'
            >
              New chat
            </button>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className='w-9 h-9 rounded-full hover:bg-[#f7f4ef] flex items-center justify-center text-[#2d2a24] font-semibold'
              aria-label='More menu'
            >
              ⋯
            </button>

            {isMenuOpen && (
              <div className='absolute top-full mt-2 w-40 right-0 bg-white rounded-md shadow-md border border-[#efeae1] z-10'>
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className='w-full text-left px-3 py-2 text-sm hover:bg-[#f7f4ef]'
                  >
                    Delete chat
                  </button>
                )}
                <button
                  onClick={logout}
                  className='w-full text-left px-3 py-2 text-sm hover:bg-[#f7f4ef]'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='w-full max-w-4xl px-6 pt-20 flex-1 flex flex-col overflow-hidden'>
        <div
          ref={chatContainerRef}
          className='rounded-3xl p-5 flex-1 overflow-y-auto flex flex-col gap-3 no-scrollbar no-focus-outline'
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[70%] whitespace-pre-wrap leading-relaxed ${
                  msg.sender === 'user' ? 'text-[#2d2a24]' : 'text-[#2d2a24]'
                }`}
                style={{
                  backgroundColor:
                    msg.sender === 'user' ? '#F7F6F5' : 'transparent',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='w-full max-w-4xl px-6 py-4 sticky bottom-0 bg-transparent'>
        <div
          className='rounded-xl px-5 py-4 flex items-center gap-3 mt-5 border-[#f1eeea] border-1'
          style={{
            background: '#fff',
          }}
        >
          <span className='text-[#7b715f]'>＋</span>
          <input
            type='text'
            className='flex-1 bg-transparent outline-none text-[#2d2a24] placeholder-[#a89f8f]'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder='Ask anything'
            disabled={isConnected}
          />
          <button
            className='w-10 h-10 rounded-full text-white flex items-center justify-center'
            style={{ backgroundColor: isConnected ? '#cfc8b9' : '#bab09b' }}
            onClick={sendMessage}
            disabled={isConnected}
            aria-label='Send'
          >
            ➜
          </button>
        </div>
        {error && <div className='text-red-600 mt-2'>{error}</div>}
      </div>
    </div>
  );
}

export default ChatScreen;
