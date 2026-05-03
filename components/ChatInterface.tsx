'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { CRISIS_BANNER_TEXT } from '@/lib/constants';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

export function ChatInterface({
  initialMessages,
  greetingFirstName,
}: {
  initialMessages: ChatMsg[];
  greetingFirstName: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialMessages.length
      ? initialMessages
      : [
          {
            role: 'assistant',
            content: `Hey ${greetingFirstName}. What's on your mind?`,
          },
        ],
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [crisisBanner, setCrisisBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const next: ChatMsg[] = [
      ...messages,
      { role: 'user', content: text },
      { role: 'assistant', content: '', pending: true },
    ];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.headers.get('X-Crisis') === '1') setCrisisBanner(true);

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => 'unknown');
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: 'assistant', content: `Sorry — ${err}` };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: 'assistant', content: acc };
        return copy;
      });
    } catch (err) {
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `Couldn't reach the server. Try again?`,
        };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {crisisBanner && (
        <div
          className="card"
          style={{
            padding: 14,
            marginBottom: 12,
            borderColor: 'var(--accent-deep)',
            background: 'var(--accent-tint)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>You&rsquo;re not alone.</strong> {CRISIS_BANNER_TEXT}
        </div>
      )}

      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          minHeight: 480,
        }}
      >
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-bubble ${
                m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }`}
              style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              {m.pending && !m.content ? (
                <span className="row gap-4">
                  <span style={{ animation: 'flicker 1s ease-in-out infinite' }}>·</span>
                  <span style={{ animation: 'flicker 1s ease-in-out infinite 0.2s' }}>·</span>
                  <span style={{ animation: 'flicker 1s ease-in-out infinite 0.4s' }}>·</span>
                </span>
              ) : (
                m.content
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            padding: 16,
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-warm)',
          }}
        >
          <div className="tiny muted" style={{ marginBottom: 8, fontSize: 11 }}>
            I&rsquo;m an AI companion, not a therapist.
          </div>
          <div className="row gap-8">
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="What's there to say?"
              disabled={sending}
            />
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={sending || !input.trim()}
              type="button"
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
