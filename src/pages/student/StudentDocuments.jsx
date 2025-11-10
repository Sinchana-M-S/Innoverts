import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    formData.append('title', acceptedFiles[0].name);
    formData.append('type', 'other');

    try {
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully!');
      setDocuments([data, ...documents]);
      setShowUpload(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const handleSummarize = async (docId) => {
    try {
      const { data } = await api.post(`/documents/${docId}/summarize`);
      setDocuments(
        documents.map((doc) =>
          doc._id === docId ? { ...doc, summary: data.summary, isSummarized: true } : doc
        )
      );
      setSelectedDoc({ ...documents.find((d) => d._id === docId), ...data.document });
      toast.success('Document summarized!');
    } catch (error) {
      toast.error('Failed to summarize document');
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(documents.filter((doc) => doc._id !== docId));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black dark:text-white">My Documents</h1>
          <Button variant="primary" onClick={() => setShowUpload(true)}>
            <Upload size={18} className="mr-2" />
            Upload Document
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-xl text-gray-600 dark:text-gray-400">No documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <FileText size={32} className="text-gray-500 dark:text-gray-400" />
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-black dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{doc.type}</p>
                    <div className="space-y-2">
                      {!doc.isSummarized ? (
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleSummarize(doc._id)}
                        >
                          <Sparkles size={16} className="mr-2" />
                          Summarize
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          View Summary
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={48} className="mx-auto mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-black dark:text-white">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">or click to select</p>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            Supports: PDF, DOC, DOCX, TXT, MD (Max 10MB)
          </p>
        </div>
        {uploading && (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-400">Uploading...</div>
        )}
      </Modal>

      {/* Summary Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title}
      >
        {selectedDoc?.summary ? (
          <div className="prose prose-invert dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedDoc.summary}</p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No summary available</p>
        )}
      </Modal>
    </div>
  );
}

