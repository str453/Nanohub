import { useRef, useState } from 'react';
import './ChatBot.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="chat-trigger" onClick={() => setOpen(true)}>
        💬 Chat Bot
      </button>
      {open && <ChatModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ChatModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const assistantBufferRef = useRef('');

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const next = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setStreaming(true);
    assistantBufferRef.current = '';

    console.log('Sending messages:', next);

    let resp;
    try {
      resp = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3
        })
      });
    } catch (err) {
      console.error('Network error:', err);
      setMessages(m => [...m, { role: 'assistant', content: 'Network error; cannot reach server.' }]);
      setStreaming(false);
      return;
    }

    if (!resp.ok) {
      console.error('Chat error status:', resp.status);
      setMessages(m => [...m, { role: 'assistant', content: `Server error (${resp.status}).` }]);
      setStreaming(false);
      return;
    }

    if (resp.body && resp.body.getReader) {
      try {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });

          if (chunk) {
            assistantBufferRef.current += chunk;
            setMessages(m => {
              const last = m[m.length - 1];
              if (last?.role === 'assistant') {
                return [...m.slice(0, -1), { role: 'assistant', content: assistantBufferRef.current }];
              }
              return [...m, { role: 'assistant', content: assistantBufferRef.current }];
            });
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
      }
    } else {
      const text = await resp.text();
      console.log('Non-stream reply:', text);
      setMessages(m => [...m, { role: 'assistant', content: text }]);
    }

    setStreaming(false);
  }

  return (
    <div className="chat-backdrop" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-header">
          <strong>Store Support</strong>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-body">
          {messages.filter(m => m.role !== 'system').map((m, idx) => (
            <div key={idx} className={`msg ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {streaming && <div className="thinking">…thinking</div>}
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about GPUs, builds, budgets…"
            disabled={streaming}
          />
          <button disabled={streaming} type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
