import './App.css'
import { useState, useEffect, useRef } from 'react';

export default function App() {
  return (
    <div className="App">
      <Chat />
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<{ message?: string; screenName?: string, chatroom?: string }[]>([{}]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [screenName, setScreenName] = useState('Anonymous');
  const [selectedChatroom, setSelectedChatroom] = useState('chatroom1');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://chat-ws-b45f.onrender.com/messages?chatroom=${selectedChatroom}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const ws = new WebSocket('wss://chat-ws-b45f.onrender.com');
    wsRef.current = ws;

    fetchMessages()

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const { message, screenName, chatroom } = JSON.parse(event.data);
      setMessages(prev => [...prev, { screenName, message, chatroom }]);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [selectedChatroom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(JSON.stringify({ message: input, screenName, chatroom: selectedChatroom }));
      setMessages(prev => [...prev, { screenName, message: input, chatroom: selectedChatroom }]);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="Chat">
      <div className="chat-header">
        <h1>Chat</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="chat-input-section">
        <div className="input-group">
          <label htmlFor="screenName">Name</label>
          <input
            id="screenName"
            type="text"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className='input-group'>
          <label htmlFor="chatroom-selection">Chatroom</label>
          <select id="chatroom-selection" value={selectedChatroom} onChange={e => setSelectedChatroom(e.target.value)}>
            <option value="chatroom1">Chatroom 1</option>
            <option value="chatroom2">Chatroom 2</option>
            <option value="chatroom3">Chatroom 3</option>
          </select>
        </div>
      </div>

      <div className="messages-container">
        {messages.filter(msg => msg.message).map((msg, index) => (
          <div key={index} className={`message ${msg.screenName === screenName ? 'own' : 'other'}`}>
            <div className="message-sender">{msg.screenName || 'Anonymous'}</div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={!input.trim() || !isConnected}
        >
          Send
        </button>
      </div>
    </div>
  );
}
