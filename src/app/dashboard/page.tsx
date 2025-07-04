'use client';
import React, { useState, useEffect, useRef, use, useContext, useCallback } from 'react';
import { Send, Search, Menu, Phone, Video, MoreVertical, Paperclip, Smile, X  , Mic, MicOff, VideoOff} from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useSocket } from '@/app/providers/Socket';
import { usePeer } from '../providers/Peer';

const DashBoard = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [inComingCall, setInComingCall] = useState<{ email: string; offer: RTCSessionDescriptionInit } | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteEmail, setRemoteEmail] = useState<string | null>(null);
  const [isMute , setIsMute] = useState(false);
  const [isVideoOff , setIsVideoOff] = useState(false);

  const user = useUser();


  const { socket } = useSocket();

  const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();

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
      const response = await axios.post('https://next-chat-app-red.vercel.app/api/send-message', { email1: userEmail, email2: chatEmail, content: newMessage });
      // const response = await axios.post('/api/send-message', { email1: userEmail, email2: chatEmail, content: newMessage });
      if (response.data) {
        setReloadMsg(!realoadMsg);
        socket.emit('update', chatEmail);
      }
    }
  };

  const [reloadContacts, setReloadContacts] = useState(false);


  const handleAddContact = async () => {
    const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;
    if (newContactName.trim()) {
      const response = await axios.post(`https://next-chat-app-red.vercel.app/api/add-contact`, { email: userEmail, contactMail: newContactEmail });
      // const response = await axios.post(`/api/add-contact`, { email: userEmail, contactMail: newContactEmail });
      if (response.data.message && response.data.message === 'sucess') {
        setReloadContacts(prev => !prev);
        setNewContactName('');
        setNewContactEmail('');
        setShowAddModal(false);
      } else if (response.data.message && response.data.message === 'No User Found') {
        setNewContactName("NO USER FOUND");
        setNewContactEmail("NO USER FOUND");
      }
    }
  };

  useEffect(() => {
  if (!myStream) return;
  myStream.getAudioTracks().forEach(track => {
    track.enabled = !isMute;
  });
  myStream.getVideoTracks().forEach(track => {
    track.enabled = !isVideoOff;
  });
}, [isMute, isVideoOff, myStream]);

  const handleAnswerCall = async () => {
    if (!inComingCall) return;
    const ans = await createAnswer(inComingCall.offer);
    // setRemoteEmail(inComingCall.email);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);
    sendStream(myStream);
    setInComingCall(null);
    socket.emit('answer-call', { email: inComingCall?.email, ans: ans });
  };

 const handleCall = async () => {
  const chat = chats[selectedChat];
  if (
    !chat ||
    !chat.email ||
    chat.email === "" ||
    chat.email === "NO USER FOUND" ||
    chat.email === "Loading"
  ) {
    alert("No contact selected or contact has no valid email.");
    return;
  }
  const offer = await createOffer();
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  setMyStream(stream);
  sendStream(stream);
  console.log('mail'  +  chat.email)
  setRemoteEmail(chat.email);
  socket.emit('call', { email: chat.email, offer });
}
  const handleUpdate = useCallback(() => setReloadMsg(prev => !prev), []);
  const handleIncomingCall = useCallback(async (data: { email: string, offer: RTCSessionDescriptionInit }) => {
    const { email, offer } = data;
    console.log('email' + email);
    setRemoteEmail(email);
    setInComingCall(() => ({ email, offer }));
  }, []);

  const handleCallAnswered = useCallback(async (data: { email: string, ans: RTCSessionDescriptionInit }) => {
    const { email, ans } = data;
    setRemoteAns(ans);
    // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // setMyStream(stream);
    // sendStream(stream);
  }, []);

  const handleNegotitation = useCallback(async () => {
    if (!peer || !remoteEmail) return
    if (peer.signalingState !== "stable") return;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('call', { email: remoteEmail, offer });
}, [remoteEmail, peer, socket]);

  // Socket event listeners
  useEffect(() => {
    socket.on('update', handleUpdate);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', handleCallAnswered);
    peer.addEventListener('negotiationneeded', handleNegotitation);

    return () => {
      socket.off('update', handleUpdate);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      peer.removeEventListener('negotiationneeded', handleNegotitation);
    };
  }, [handleUpdate, handleIncomingCall, handleCallAnswered, handleNegotitation]);

  useEffect(() => {
    (async () => {
      if (!user.isLoaded) return;
      const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;
      if (!chats[selectedChat]) return;
      const chatEmail = chats[selectedChat].email;
      if (!chatEmail) return;
      const response = await axios.post("https://next-chat-app-red.vercel.app/api/get-messages", { email1: userEmail, email2: chatEmail });
      // const response = await axios.post("/api/get-messages", { email1: userEmail, email2: chatEmail });
      setMessages(response.data.response.messages);
    })();
  }, [selectedChat, chats, user.user, realoadMsg]);

  useEffect(() => {
    if (user.isLoaded && user.user) {
      const userEmail = user.user?.emailAddresses?.[0]?.emailAddress;

      (async () => {
        const response = await axios.post(`https://next-chat-app-red.vercel.app/api/get-user` , {email : userEmail , name : user.user?.fullName , avatar : user.user?.imageUrl});
        // const response = await axios.post(`/api/get-user`, { email: userEmail, name: user.user?.fullName, avatar: user.user?.imageUrl });
        setChats(response.data.contacts);
      })();

      socket.emit('email', userEmail);
      
    }
  }, [user.isLoaded, user.user, reloadContacts]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (myStream) console.log('My Stream:', myStream);
  if (remoteStream) console.log('Remote Stream:', remoteStream);

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
                  {chat.avatar && <img src={chat.avatar} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-semibold" />}

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
            <Phone className="w-5 h-5 cursor-pointer hover:bg-gray-100 p-0.5 rounded" onClick={handleCall} />
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
          <div ref={messagesEndRef} />
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

      {inComingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Incoming Call from {inComingCall.email}</h3>
              <button
                onClick={() => setInComingCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setInComingCall(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reject
              </button>
              <button
                onClick={handleAnswerCall}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {myStream && remoteStream && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-semibold text-white">Video Call</h3>
          </div>
          <button
            onClick={() => setInComingCall(null)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative p-6">
          {/* Remote Video (Main) */}
          <div className="relative w-full h-96 bg-gray-800 rounded-xl overflow-hidden mb-4">
            <video
              autoPlay
              playsInline
              ref={video => {
                if (video && remoteStream) {
                  video.srcObject = remoteStream;
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              Remote
            </div>
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-10 right-10 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            <video
              autoPlay
              playsInline
              muted
              ref={video => {
                if (video && myStream) {
                  video.srcObject = myStream;
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              You
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 p-6 bg-gray-900 bg-opacity-50">
           <button
              onClick={() => setIsMute(!isMute)}
              className={`p-3 rounded-full transition-colors 
                ${isMute ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} 
                text-white`}
              title={isMute ? "Unmute" : "Mute"}
            >
              {isMute ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full transition-colors 
                ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} 
                text-white`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </button>
          <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors shadow-lg">
            <Phone className="w-6 h-6" />
          </button>
        </div>

        {/* Call Duration */}
        <div className="text-center pb-4">
          <span className="text-gray-400 text-sm">00:45</span>
        </div>
      </div>
    </div>
      )}


    </div>
  );
};

export default DashBoard;