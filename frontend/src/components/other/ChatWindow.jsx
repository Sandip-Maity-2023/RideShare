import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, X, MessageSquare } from 'lucide-react';

const ChatWindow = ({ tripId, currentUser, socket, participantName = 'Driver/Passenger', onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_trip', { tripId });

    socket.on('receive_message', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, tripId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      tripId,
      sender: currentUser.name,
      senderId: currentUser._id,
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (socket) {
      socket.emit('send_message', messageData);
    } else {
      // Local preview fallback
      setMessages((prev) => [...prev, messageData]);
    }

    setInputMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white border border-gray-300 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden h-[450px]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold text-sm truncate">{participantName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => alert(`Initiating call to ${participantName}...`)}
            className="p-1.5 hover:bg-blue-700 rounded-full transition"
            title="Call"
          >
            <Phone className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-blue-700 rounded-full transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-sm">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?._id || msg.sender === currentUser?.name;
            return (
              <div
                key={index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-200 bg-white flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
