import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPaperPlane, FaTimes, FaCommentDots, FaCheckCircle, FaSpinner, FaTrash } from 'react-icons/fa';
import './MessagesTab.css';

const MessagesTab = ({ user, isOwner }) => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [chats, setChats] = useState([]);
    const [activeChatIndex, setActiveChatIndex] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadConversations = async () => {
            setLoading(true);
            try {
                const userId = user.id || user._id;
                // Query real enquiries from database
                const url = isOwner
                    ? `${API}/api/enquiries/owner/${userId}`
                    : `${API}/api/enquiries/sender/${user.phone || ''}`;
                
                const res = await axios.get(url);
                const enquiries = res.data.enquiries || [];

                // Map inquiries into active chat threads
                const mappedChats = enquiries.map((enq, idx) => {
                    const initials = enq.senderName ? enq.senderName.substring(0, 2).toUpperCase() : 'UR';
                    const colors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#ec4899'];
                    const avatarColor = colors[idx % colors.length];

                    const messages = [
                        {
                            text: enq.message || `Hi! I am interested in your property. Let's discuss.`,
                            sender: isOwner ? 'them' : 'me',
                            time: new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ];

                    return {
                        id: enq._id,
                        name: isOwner ? enq.senderName : (enq.property?.owner?.name || 'Property Owner'),
                        role: isOwner ? 'Interested Buyer' : 'Verified Owner',
                        phone: isOwner ? enq.senderPhone : '',
                        initials,
                        time: new Date(enq.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' }),
                        lastText: enq.message ? enq.message.substring(0, 30) + '...' : 'Callback request',
                        unread: enq.status === 'new',
                        avatarColor,
                        messages,
                        propertyName: enq.property?.title || 'General Inquiry'
                    };
                });

                setChats(mappedChats);
            } catch (err) {
                console.error('Failed to load real enquiries for messages:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadConversations();
        }
    }, [user, isOwner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, activeChatIndex, isTyping]);

    const handleDeleteChat = async () => {
        if (activeChatIndex === null) return;
        const chatId = chats[activeChatIndex].id;
        
        // Confirmation
        if (!window.confirm('Are you sure you want to delete this chat history?')) return;

        try {
            await axios.delete(`${API}/api/enquiries/${chatId}`);
            const updated = chats.filter((_, idx) => idx !== activeChatIndex);
            setChats(updated);
            setActiveChatIndex(null);
        } catch (err) {
            console.error('Failed to delete chat:', err);
            alert('Could not delete chat at this time.');
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || activeChatIndex === null) return;

        const currentChat = chats[activeChatIndex];
        const newMsg = {
            text: chatInput,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedChats = [...chats];
        updatedChats[activeChatIndex].messages.push(newMsg);
        updatedChats[activeChatIndex].lastText = chatInput.substring(0, 30) + '...';
        updatedChats[activeChatIndex].unread = false;
        updatedChats[activeChatIndex].time = 'Just Now';
        setChats(updatedChats);
        setChatInput('');

        // Simulate smart automated response
        setIsTyping(true);
        setTimeout(() => {
            let replyText = "Thank you for reaching out! I will review your query and get back shortly.";
            const userMsg = chatInput.toLowerCase();

            if (isOwner) {
                // Seller responses
                if (userMsg.includes('price') || userMsg.includes('negotiable') || userMsg.includes('discount')) {
                    replyText = "The listing price is reasonably flexible for serious buyers. Would you like to schedule a call to finalize details?";
                } else if (userMsg.includes('visit') || userMsg.includes('tour') || userMsg.includes('see')) {
                    replyText = "Certainly! I would be happy to host you for a physical property tour. Please suggest a suitable date.";
                } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
                    replyText = "Hello! Thanks for your message. How can I help you regarding my listed property today?";
                }
            } else {
                // Buyer responses (simulating property owner)
                if (userMsg.includes('price') || userMsg.includes('negotiable') || userMsg.includes('discount')) {
                    replyText = "Hi! Yes, the price is slightly negotiable for swift deals. If you're highly interested, please make an offer via the property page!";
                } else if (userMsg.includes('visit') || userMsg.includes('tomorrow') || userMsg.includes('meet')) {
                    replyText = "That sounds perfect. Let's arrange a physical visit. You can finalize the date using the dashboard scheduling tool.";
                } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
                    replyText = "Hello! Thanks for reaching out. Please ask any questions you have regarding my property.";
                }
            }

            const botMsg = {
                text: replyText,
                sender: 'them',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            updatedChats[activeChatIndex].messages.push(botMsg);
            updatedChats[activeChatIndex].lastText = replyText.substring(0, 30) + '...';
            setChats(updatedChats);
            setIsTyping(false);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="messages-loading">
                <FaSpinner className="spin" />
                <p>Syncing secure chats...</p>
            </div>
        );
    }

    return (
        <div className="messages-tab-pane">
            <div className="messages-tab-header">
                <h2>Conversations & Chats</h2>
                <p>Track direct interactions with buyers, owners, and verified agents in real-time.</p>
            </div>

            <div className="messages-layout-box">
                {/* Conversations List (Left) */}
                <div className="conversations-sidebar">
                    {chats.map((c, index) => (
                        <div
                            key={c.id}
                            className={`convo-row ${activeChatIndex === index ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
                            onClick={() => {
                                setActiveChatIndex(index);
                                const updated = [...chats];
                                updated[index].unread = false;
                                setChats(updated);
                            }}
                        >
                            <div className="convo-avatar" style={{ backgroundColor: c.avatarColor }}>
                                {c.initials}
                                {c.unread && <span className="unread-pulse"></span>}
                            </div>
                            <div className="convo-mid">
                                <div className="convo-head">
                                    <h4>{c.name}</h4>
                                    <span className="time">{c.time}</span>
                                </div>
                                <span className="convo-role-badge">{c.role}</span>
                                <span className="convo-prop-lbl">{c.propertyName}</span>
                                <p className="convo-preview">{c.lastText}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inline Message thread panel (Right) */}
                <div className="message-thread-panel">
                    {activeChatIndex !== null ? (
                        <>
                            <div className="thread-header">
                                <div className="thread-avatar" style={{ backgroundColor: chats[activeChatIndex].avatarColor }}>
                                    {chats[activeChatIndex].initials}
                                </div>
                                <div className="thread-meta">
                                    <h4>{chats[activeChatIndex].name}</h4>
                                    <p className="thread-status">{chats[activeChatIndex].role} · {chats[activeChatIndex].propertyName}</p>
                                </div>
                                {chats[activeChatIndex].phone && (
                                    <span className="thread-phone">📱 {chats[activeChatIndex].phone}</span>
                                )}
                                <button className="delete-chat-btn" onClick={handleDeleteChat} title="Delete Chat" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem', padding: '8px' }}>
                                    <FaTrash />
                                </button>
                            </div>

                            <div className="thread-body">
                                {chats[activeChatIndex].messages.map((m, mIdx) => (
                                    <div key={mIdx} className={`bubble-row ${m.sender === 'me' ? 'me' : 'them'}`}>
                                        <div className="chat-bubble">
                                            {m.text}
                                            <span className="bubble-stamp">{m.time}</span>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="bubble-row them">
                                        <div className="chat-bubble typing-bubble">
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="thread-footer">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <button type="submit" className="send-btn-tab" disabled={!chatInput.trim()}>
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="thread-empty-state">
                            <FaCommentDots className="empty-chat-icon" />
                            <h3>No active thread selected</h3>
                            <p>Click on an inquiry conversation on the left list to view message history and start chatting in real-time!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesTab;
