'use client';
import React, { useState, useEffect , useRef} from 'react';
import { Send, Search, Menu, Phone, Video, MoreVertical, Paperclip, Smile, X } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { io } from 'socket.io-client';

const DashBoard = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const user = useUser();


  const socket = useRef<any>(null);


  useEffect(() => {
    if (!socket.current) {
      socket.current = io("https://chat-socket-server-kb9v.onrender.com", {
        transports: ["websocket", "polling"]
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);


  const [chats, setChats] = useState([{
    _id: 1,
    name: "Loading",
    email: "",
    lastMessage: "",
    time: "",
    unread: 0,
    online: true,
    avatar: ""
  }]);

  const [messages, setMessages] = useState([
    {
      _id: 1,
      sender: "Loading",
      content: "Loading",
      time: "Loading",
      isOwn: false
    }
  ]);

  const [realoadMsg, setReloadMsg] = useState(false);

  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);



  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setNewMessage('');
      const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;
      const chatEmail = chats[selectedChat].email;
      const response = await axios.post('/api/send-message', { email1: userEmail, email2: chatEmail, content: newMessage });
      if (response.data) {
        setReloadMsg(!realoadMsg);
        socket.current.emit('update', chatEmail);
      }
    }
  };

  const [reloadContacts, setReloadContacts] = useState(false);


  const handleAddContact = async () => {
    const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;
    if (newContactName.trim()) {
      const response = await axios.post(`/api/add-contact`, { email: userEmail, contactMail: newContactEmail });
      if (response.data.message && response.data.message === 'sucess') {
        setReloadContacts(prev => !prev);
        setNewContactName('');
        setNewContactEmail('');
        setShowAddModal(false);
      }else if(response.data.message && response.data.message === 'No User Found'){
        setNewContactName("NO USER FOUND");
        setNewContactEmail("NO USER FOUND");
      }
    }
  };

  useEffect(() => {
    const handleUpdate = () => setReloadMsg(prev => !prev);
    socket.current.on('update', handleUpdate);
    return () => {
      socket.current.off('update', handleUpdate);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!user.isLoaded) return;
      const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;
      if(!chats[selectedChat]) return;
      const chatEmail = chats[selectedChat].email;
      if (!chatEmail) return;
      const response = await axios.post("/api/get-messages", { email1: userEmail, email2: chatEmail });
      setMessages(response.data.response.messages);
    })();
  }, [selectedChat, chats, user.user, realoadMsg]);

  useEffect(() => {
    if (user.isLoaded && user.user) {
      const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;

      (async () => {
        const response = await axios.post(`/api/get-user` , {email : userEmail , name : user.user?.fullName , avatar : user.user?.imageUrl});
        setChats(response.data.contacts);
      })();

      socket.current.emit('email', userEmail);
    }
  }, [user.isLoaded, user.user, reloadContacts]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white text-black relative">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Menu className="w-5 h-5 cursor-pointer hover:bg-gray-100 p-0.5 rounded" />
            <div className='flex items-center scale-150 p-2'>
              <UserButton />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, index) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(index)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${selectedChat === index ? 'bg-gray-100' : ''
                }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {chat.avatar &&  <img src={chat.avatar} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-semibold" />}
                    
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <div className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className='block ml-auto m-6 p-4 py-2 bg-black text-white rounded-full text-3xl cursor-pointer hover:bg-gray-800'
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {chats[selectedChat]?.avatar && <img src={chats[selectedChat]?.avatar} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold" />}
                
              {chats[selectedChat]?.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{chats[selectedChat]?.name}</h2>
              <p className="text-sm text-gray-500">
                {chats[selectedChat]?.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 cursor-pointer hover:bg-gray-100 p-0.5 rounded" />
            <Video className="w-5 h-5 cursor-pointer hover:bg-gray-100 p-0.5 rounded" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:bg-gray-100 p-0.5 rounded" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${user.isLoaded && message.sender === user.user?.emailAddresses[0].emailAddress ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${user.isLoaded && message.sender === user.user?.emailAddresses[0].emailAddress
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${user.isLoaded && message.sender === user.user?.emailAddresses[0].emailAddress ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Paperclip className="w-5 h-5 text-gray-400 cursor-pointer hover:text-black" />

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black pr-10"
              />
              <Smile className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-black" />
            </div>

            <button
              onClick={handleSendMessage}
              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;