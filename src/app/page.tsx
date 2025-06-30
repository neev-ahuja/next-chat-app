import { SignInButton, SignUpButton} from '@clerk/nextjs';
import {auth , currentUser} from '@clerk/nextjs/server';
import { MessageCircle, Phone, Camera, Video, Send, Users, Shield, Zap } from 'lucide-react';
import {redirect} from 'next/navigation';

export default async function Home() {

  const { userId } = await auth();

  if(userId) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ChatFlow</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-gray-600 hover:text-black transition-colors">Features</a>
            <a className="text-gray-600 hover:text-black transition-colors">Contact</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 hover:text-black transition-colors">
              <SignInButton mode="modal">Sign In</SignInButton>
            </span>
            <span className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <SignUpButton mode="modal">Get Started</SignUpButton>
            </span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect Beyond
            <span className="block text-gray-600">Words</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience seamless communication with instant messaging, crystal-clear calls, 
            and effortless media sharing. All in one beautiful app.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105">
              Get Started
            </button>
            <button className="border-2 border-black text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-black hover:text-white transition-all">
              Watch Demo
            </button>
          </div>
          
          {/* App Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-black rounded-3xl p-8 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                    <div>
                      <div className="font-semibold">Alex Johnson</div>
                      <div className="text-sm text-gray-500">Online</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <Video className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-end">
                    <div className="bg-black text-white px-4 py-2 rounded-2xl max-w-xs">
                      Hey! How's your day going?
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl max-w-xs">
                      Pretty good! Just finished that project we discussed
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-gray-100 px-2 py-2 rounded-2xl flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Photo shared</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent outline-none"
                  />
                  <Send className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="block text-gray-400">Stay Connected</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for seamless communication in the modern world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Chat Feature */}
            <div className="group p-8 border border-gray-800 rounded-2xl hover:bg-gray-900 transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Messaging</h3>
              <p className="text-gray-400 mb-6">
                Lightning-fast messaging with real-time delivery, read receipts, and typing indicators.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• End-to-end encryption</li>
                <li>• Group chats up to 1000 members</li>
                <li>• Message reactions & replies</li>
              </ul>
            </div>
            
            {/* Media Feature */}
            <div className="group p-8 border border-gray-800 rounded-2xl hover:bg-gray-900 transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Photos & Videos</h3>
              <p className="text-gray-400 mb-6">
                Share memories instantly with high-quality photo and video sharing capabilities.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• 4K video support</li>
                <li>• Smart compression</li>
                <li>• Stories & highlights</li>
              </ul>
            </div>
            
            {/* Calls Feature */}
            <div className="group p-8 border border-gray-800 rounded-2xl hover:bg-gray-900 transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Voice & Video Calls</h3>
              <p className="text-gray-400 mb-6">
                Crystal-clear voice and HD video calls with advanced noise cancellation.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• HD video quality</li>
                <li>• Group calls up to 50 people</li>
                <li>• Screen sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-black mb-2">50M+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">10B+</div>
              <div className="text-gray-600">Messages Sent</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">150+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              Why Choose ChatFlow?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Privacy First</h3>
              <p className="text-gray-600">Your conversations are protected with military-grade encryption and zero data collection.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-600">Experience instant message delivery and seamless performance across all devices.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Driven</h3>
              <p className="text-gray-600">Built by users, for users. We listen to feedback and continuously improve the experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="px-6 py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join millions of users who trust ChatFlow for their daily communication needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-all transform hover:scale-105">
              Click Here to Start!
            </button>
          </div>
          
          <p className="text-gray-400">
            Available on all platforms • Free to download • No ads, ever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChatFlow</span>
              </div>
              <p className="text-gray-600">
                The future of communication is here. Connect, share, and call with confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2025 ChatFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}