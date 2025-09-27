'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  EyeSlashIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface EncryptedMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  encrypted: boolean;
  circleId?: string;
}

interface Circle {
  id: string;
  name: string;
  memberCount: number;
  unreadCount: number;
}

export default function EncryptedMessaging() {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading circles and messages
    setTimeout(() => {
      setCircles([
        { id: '1', name: 'DeFi Builders Circle', memberCount: 5, unreadCount: 3 },
        { id: '2', name: 'Privacy Advocates', memberCount: 12, unreadCount: 1 },
        { id: '3', name: 'Lending Innovators', memberCount: 8, unreadCount: 0 }
      ]);
      
      if (!selectedCircle) {
        setSelectedCircle('1');
      }
      
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      // Load messages for selected circle
      setMessages([
        {
          id: '1',
          sender: 'Anonymous_7x9k',
          content: 'Payment confirmation for Round 3 received. ZK proof validated.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isOwn: false,
          encrypted: true,
          circleId: selectedCircle
        },
        {
          id: '2',
          sender: 'You',
          content: 'Great! Ready for the next bidding round.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isOwn: true,
          encrypted: true,
          circleId: selectedCircle
        },
        {
          id: '3',
          sender: 'Anonymous_3m2n',
          content: 'Trust score updated successfully. Maintaining high privacy standards.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isOwn: false,
          encrypted: true,
          circleId: selectedCircle
        }
      ]);
    }
  }, [selectedCircle]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCircle) return;

    setIsEncrypting(true);
    
    // Simulate message encryption
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const message: EncryptedMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
      encrypted: true,
      circleId: selectedCircle
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsEncrypting(false);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 privacy-fade-in">
      {/* Circle List */}
      <div className="lg:w-1/3 bg-midnight-900/60 backdrop-blur-lg rounded-xl border border-midnight-700/50">
        <div className="p-6 border-b border-midnight-700/50">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-zk-purple" />
            <h2 className="text-lg font-semibold text-white">Encrypted Messages</h2>
          </div>
          <p className="text-sm text-midnight-400 mt-1">End-to-end encrypted circle communications</p>
        </div>
        
        <div className="p-4 space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-midnight-800/50 rounded-lg animate-pulse">
                <div className="h-4 bg-midnight-700 rounded mb-2"></div>
                <div className="h-3 bg-midnight-700 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            circles.map((circle) => (
              <button
                key={circle.id}
                onClick={() => setSelectedCircle(circle.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedCircle === circle.id
                    ? 'bg-zk-purple/20 border border-zk-purple/30'
                    : 'bg-midnight-800/50 hover:bg-midnight-800/70 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{circle.name}</span>
                  {circle.unreadCount > 0 && (
                    <span className="bg-zk-purple text-white text-xs px-2 py-1 rounded-full">
                      {circle.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-3 w-3 text-midnight-400" />
                  <span className="text-xs text-midnight-400">{circle.memberCount} members</span>
                  <LockClosedIcon className="h-3 w-3 text-trust-green" />
                  <span className="text-xs text-trust-green">Encrypted</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-midnight-900/60 backdrop-blur-lg rounded-xl border border-midnight-700/50 flex flex-col">
        {selectedCircle ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-midnight-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {circles.find(c => c.id === selectedCircle)?.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <EyeSlashIcon className="h-4 w-4 text-zk-purple" />
                    <span className="text-sm text-zk-purple">Anonymous participants</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-trust-green/20 text-trust-green px-3 py-2 rounded-lg">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">E2E Encrypted</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.isOwn 
                      ? 'bg-zk-purple text-white' 
                      : 'bg-midnight-800 text-midnight-100'
                  }`}>
                    {!message.isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-midnight-400">
                          {message.sender}
                        </span>
                        <LockClosedIcon className="h-3 w-3 text-trust-green" />
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn ? 'text-purple-200' : 'text-midnight-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-midnight-700/50">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type an encrypted message..."
                    className="w-full bg-midnight-800 border border-midnight-600 rounded-lg px-4 py-3 text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-zk-purple focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && !isEncrypting && handleSendMessage()}
                    disabled={isEncrypting}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isEncrypting}
                  className="bg-zk-purple hover:bg-zk-purple-dark disabled:bg-midnight-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isEncrypting ? (
                    <>
                      <LockClosedIcon className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Encrypting...</span>
                    </>
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <LockClosedIcon className="h-3 w-3 text-trust-green" />
                <span className="text-xs text-midnight-400">
                  Messages are end-to-end encrypted using perfect forward secrecy
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-midnight-600 mx-auto mb-4" />
              <p className="text-midnight-400">Select a circle to view encrypted messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}