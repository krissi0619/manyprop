import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaLocationArrow, FaRobot, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm PropBot, your virtual real estate assistant. How can I help you today?", isBot: true },
        { type: 'options', options: ['Find a property to buy', 'Find a property to rent', 'Post a new property', 'Contact Support'] }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleOptionClick = (option) => {
        addMessage(option, false);

        setTimeout(() => {
            let botReply = "I can help with that!";
            let action = null;

            if (option === 'Find a property to buy') {
                botReply = "Great! Check out our properties for sale. Are you looking in a specific city like Delhi or Pune?";
                action = () => navigate('/properties?type=buy');
            } else if (option === 'Find a property to rent') {
                botReply = "Awesome! We have many rental listings. Shall I take you to them?";
                action = () => navigate('/properties?type=rent');
            } else if (option === 'Post a new property') {
                botReply = "You can post your property for free! Redirecting you now...";
                action = () => navigate('/post-property');
            } else if (option === 'Contact Support') {
                botReply = "You can reach our support team at +91 9854698542 or email manypropind@gmail.com.";
            }

            setMessages(prev => [...prev, { text: botReply, isBot: true }]);
            if (action) setTimeout(action, 1500);

        }, 800);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        addMessage(input, false);
        setInput('');

        // Simulate basic bot logic
        setTimeout(() => {
            const lowerInput = input.toLowerCase();
            let reply = "I'm still learning, but you can explore properties using the search bar! Is there anything specific you need?";

            if (lowerInput.includes('buy') || lowerInput.includes('purchase')) {
                reply = "Looking to buy? Click the Explore button above or let me take you to the listings!";
            } else if (lowerInput.includes('rent')) {
                reply = "We have great rental options available. Give it a search on our properties page!";
            } else if (lowerInput.includes('sell') || lowerInput.includes('post')) {
                reply = "You can easily click 'Post Property (Free)' in our header to list your space.";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                reply = "Hello! How can I assist you in finding your dream space today?";
            }

            setMessages(prev => [...prev, { text: reply, isBot: true }]);
        }, 1000);
    };

    const addMessage = (text, isBot) => {
        setMessages(prev => prev.filter(msg => msg.type !== 'options').concat({ text, isBot }));
    };

    return (
        <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chat-fab" onClick={toggleChat} aria-label="Open Chat">
                    <FaCommentDots />
                </button>
            )}

            {/* Chat Window */}
            <div className={`chat-window ${isOpen ? 'active' : ''}`}>
                <div className="chat-header">
                    <div className="header-info">
                        <FaRobot className="header-icon" />
                        <div>
                            <h3>PropBot</h3>
                            <p>Online</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={toggleChat}>
                        <FaTimes />
                    </button>
                </div>

                <div className="chat-body">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.isBot ? 'bot' : 'user'} ${msg.type === 'options' ? 'options-row' : ''}`}>
                            {msg.type === 'options' ? (
                                <div className="chat-options">
                                    {msg.options.map((opt, i) => (
                                        <button key={i} className="chat-option-btn" onClick={() => handleOptionClick(opt)}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className={`message-bubble ${msg.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-footer" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={!input.trim()}>
                        <FaLocationArrow />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
