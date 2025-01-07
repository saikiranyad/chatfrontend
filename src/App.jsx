import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('https://chatbackend-4hjt.onrender.com');

function App() {
  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('User' + Math.floor(Math.random() * 100));

  useEffect(() => {
    if (group) {
      socket.emit('joinGroup', group);
      fetchMessages();
    }

    socket.on('receiveMessage', (data) => {
      if (data.group === group) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [group]);

  const fetchMessages = async () => {
    const response = await axios.get(`http://localhost:5000/messages/${group}`);
    setMessages(response.data);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const data = { group, user, message };
      socket.emit('sendMessage', data);
      setMessages((prevMessages) => [...prevMessages, data]);
      setMessage('');
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Group Chat</h1>
          <input
            type="text"
            placeholder="Enter group name"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="group-input"
          />
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.user === user ? 'own-message' : 'other-message'
              }`}
            >
              <span className="message-user">{msg.user}:</span>
              <span className="message-text">{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
