import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Upload } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from './ui/Button';
import { Card } from './ui/Card';

export default function FloatingChatbot() {
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Only show for authenticated students
  if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'both')) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in production, integrate with OpenAI API)
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: `I understand you're asking about: "${userMessage.content}". This is a simulated response. In production, this would connect to an AI service for real-time explanations.`,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleFileUpload = () => {
    // File upload functionality
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: `Uploaded: ${file.name}`, file: file.name },
        ]);
      }
    };
    input.click();
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96"
          >
            <Card className="flex h-[500px] flex-col">
              <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-lg font-bold text-black dark:text-white">AI Assistant</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ask questions about your courses</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>Ask me anything about your courses!</p>
                    <p className="mt-2 text-sm">
                      You can also mention timestamps for video explanations.
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.file && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">📎 {msg.file}</p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-gray-200 dark:bg-gray-800 px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-black dark:bg-white" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-black dark:bg-white delay-75" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-black dark:bg-white delay-150" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <button
                    onClick={handleFileUpload}
                    className="rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                  >
                    <Upload size={18} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                  <Button variant="primary" onClick={handleSend} size="sm">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

