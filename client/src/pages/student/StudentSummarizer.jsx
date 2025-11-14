import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Video, FileText, BookOpen, Upload, MessageCircle, Send } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function StudentSummarizer() {
  const [courseId, setCourseId] = useState('');
  const [videoIndex, setVideoIndex] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [resourceText, setResourceText] = useState('');
  
  // PDF Summarizer states
  const [pdfSummary, setPdfSummary] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfRawText, setPdfRawText] = useState('');
  const fileInputRef = useRef(null);
  
  // Q&A states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  const handleSummarize = async (type) => {
    setLoading(true);
    setSummary('');
    
    try {
      let textToSummarize = '';
      
      if (type === 'course') {
        if (!courseId) {
          toast.error('Please enter a course ID');
          setLoading(false);
          return;
        }
        // For demo, use courseId as text. In production, fetch course content
        textToSummarize = `Course content for course ID: ${courseId}. This is a placeholder. In production, fetch actual course content.`;
      } else if (type === 'video') {
        if (!courseId || videoIndex === '') {
          toast.error('Please enter both course ID and video index');
          setLoading(false);
          return;
        }
        // For demo, use video info as text. In production, fetch video transcript
        textToSummarize = `Video transcript for course ${courseId}, video ${videoIndex}. This is a placeholder. In production, fetch actual video transcript.`;
      } else if (type === 'text' && resourceText) {
        textToSummarize = resourceText;
      } else {
        toast.error('Please provide content to summarize');
        setLoading(false);
        return;
      }

      const { data } = await api.post('/api/ai/summarize', {
        resource_text: textToSummarize,
        session_id: `summary_${Date.now()}`,
        language_code: 'en-IN'
      });

      setSummary(data.summary || 'Summary generated successfully!');
      toast.success('Summary created!');
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error('Failed to summarize. Please check if AI service is running.');
      setSummary('Error: Could not generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF file selection
  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setPdfFileName(file.name);
        toast.success('File selected! Click "Summarize PDF" to process.');
      } else {
        toast.error('Please upload a PDF or image file');
        e.target.value = '';
      }
    }
  };

  // Handle PDF summarization
  const handlePdfSummarize = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Please select a file first');
      return;
    }

    setPdfLoading(true);
    setPdfSummary('');
    setPdfRawText('');
    setAnswer('');
    setQaHistory([]);

    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('document', file);
      formData.append('language_code', 'en-IN');

      const { data } = await api.post('/api/ai/read-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Store the summary and raw text
      setPdfSummary(data.english_explanation || data.vernacular_explanation || 'Summary generated successfully!');
      setPdfRawText(data.raw_text || '');
      toast.success('PDF summarized successfully!');
    } catch (error) {
      console.error('PDF summarization error:', error);
      toast.error(error.response?.data?.error || 'Failed to summarize PDF. Please check if AI service is running.');
      setPdfSummary('Error: Could not generate summary. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle Q&A based on PDF summary
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!pdfSummary && !pdfRawText) {
      toast.error('Please summarize a PDF first');
      return;
    }

    setQaLoading(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      // Add question to history
      const newQaHistory = [...qaHistory, { question: currentQuestion, answer: '...' }];
      setQaHistory(newQaHistory);

      // Use the PDF summary and raw text as context
      const context = `PDF Summary:\n${pdfSummary}\n\nOriginal Text (if needed):\n${pdfRawText.substring(0, 2000)}`;

      const { data } = await api.post('/api/ai/chat', {
        message: `Based on the following PDF document summary, please answer this question: "${currentQuestion}"\n\n${context}`,
        session_id: `pdf_qa_${Date.now()}`,
        language_code: 'en-IN'
      });

      const answerText = data.response || 'I could not generate an answer. Please try again.';
      
      // Update the last Q&A entry with the answer
      const updatedQaHistory = [...newQaHistory];
      updatedQaHistory[updatedQaHistory.length - 1].answer = answerText;
      setQaHistory(updatedQaHistory);
      setAnswer(answerText);
      toast.success('Answer generated!');
    } catch (error) {
      console.error('Q&A error:', error);
      toast.error(error.response?.data?.error || 'Failed to get answer. Please try again.');
      
      // Update the last Q&A entry with error
      const updatedQaHistory = [...qaHistory];
      if (updatedQaHistory.length > 0) {
        updatedQaHistory[updatedQaHistory.length - 1].answer = 'Error: Could not generate answer. Please try again.';
        setQaHistory(updatedQaHistory);
      }
    } finally {
      setQaLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">AI Summarizer</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="text-yellow-500 dark:text-yellow-400" size={24} />
                  <span>Summarize Course</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Course ID</label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Enter course ID"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleSummarize('course')}
                  disabled={loading}
                >
                  <BookOpen size={18} className="mr-2" />
                  {loading ? 'Summarizing...' : 'Summarize Course'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="text-blue-500 dark:text-blue-400" size={24} />
                  <span>Summarize Video</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Course ID</label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Enter course ID"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Video Index</label>
                  <input
                    type="number"
                    value={videoIndex}
                    onChange={(e) => setVideoIndex(e.target.value)}
                    placeholder="Enter video index (0, 1, 2...)"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleSummarize('video')}
                  disabled={loading}
                >
                  <Video size={18} className="mr-2" />
                  {loading ? 'Summarizing...' : 'Summarize Video'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-purple-500 dark:text-purple-400" size={24} />
                  <span>Summarize Text</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Paste Text to Summarize</label>
                  <textarea
                    value={resourceText}
                    onChange={(e) => setResourceText(e.target.value)}
                    placeholder="Paste or type the content you want to summarize..."
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleSummarize('text')}
                  disabled={loading || !resourceText.trim()}
                >
                  <FileText size={18} className="mr-2" />
                  {loading ? 'Summarizing...' : 'Summarize Text'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="text-orange-500 dark:text-orange-400" size={24} />
                  <span>Summarize PDF Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Upload PDF Document</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={pdfLoading}
                    >
                      <Upload size={18} className="mr-2" />
                      {pdfFileName || 'Choose File'}
                    </Button>
                    {pdfFileName && (
                      <Button
                        variant="primary"
                        onClick={handlePdfSummarize}
                        disabled={pdfLoading}
                      >
                        {pdfLoading ? 'Processing...' : 'Summarize PDF'}
                      </Button>
                    )}
                  </div>
                  {pdfFileName && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Selected: {pdfFileName}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-green-500 dark:text-green-400" size={24} />
                  <span>Summary</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white delay-75" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white delay-150" />
                  </div>
                </div>
              ) : summary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose dark:prose-invert max-w-none"
                >
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{summary}</p>
                </motion.div>
              ) : (
                <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Enter course or video details and click summarize</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PDF Summary Section */}
        {pdfSummary && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-orange-500 dark:text-orange-400" size={24} />
                  <span>PDF Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pdfLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white" />
                      <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white delay-75" />
                      <div className="h-3 w-3 animate-bounce rounded-full bg-black dark:bg-white delay-150" />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose dark:prose-invert max-w-none"
                  >
                    <div 
                      className="whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: pdfSummary
                          .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h2>')
                          .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                          .replace(/\* (.*?)(\n|$)/g, '<li class="ml-4 list-disc">$1</li>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Q&A Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="text-blue-500 dark:text-blue-400" size={24} />
                  <span>Ask Questions About the PDF</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Q&A History */}
                {qaHistory.length > 0 && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {qaHistory.map((qa, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                      >
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Q: {qa.question}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 ml-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {qa.answer === '...' ? (
                              <span className="flex items-center gap-2">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150" />
                              </span>
                            ) : (
                              qa.answer
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Question Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !qaLoading && handleAskQuestion()}
                    placeholder="Ask a question about the PDF content..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                    disabled={qaLoading}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAskQuestion}
                    disabled={qaLoading || !question.trim()}
                  >
                    <Send size={18} className="mr-2" />
                    {qaLoading ? 'Asking...' : 'Ask'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

