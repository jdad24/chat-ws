import './App.css'
import { useState, useEffect, useRef } from 'react';

export default function App() {

  return (
    <div className="App">
      <Chat />
    </div>
  )
}

export function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [screenName, setScreenName] = useState('Anonymous');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('https://chat-ws-b45f.onrender.com/messages');
        const data = await response.json();
        setMessages(prev => [...prev, ...data]);
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
      const { message, screenName } = JSON.parse(event.data);
      setMessages(prev => [...prev, `${screenName}: ${message}`]);
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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(JSON.stringify({ message: input, screenName }));
      setMessages(prev => [...prev, `Sent: ${input}`]);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="Chat">
      <h1>Chat</h1>
      <div style={{ color: isConnected ? 'green' : 'red' }}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <input
        type="text"
        value={screenName}
        onChange={(e) => setScreenName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter your screen name..."
        style={{ width: '70%', padding: '5px' }}
      />
      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        style={{ width: '70%', padding: '5px' }}
      />
      <button onClick={sendMessage} style={{ padding: '5px 10px', marginLeft: '10px' }}>
        Send
      </button>
    </div>
  )
}
