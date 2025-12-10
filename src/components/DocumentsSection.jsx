import { useState, useEffect } from 'react';
import api from '../api';
import { Card, CardHeader, CardContent, Button, Input, Select, Modal, useToast } from '../components/ui';
import { Upload, FileText, Download, Trash2, Eye } from 'lucide-react';

const DocumentsSection = ({ employeeId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { success, error: showError } = useToast();

  const [uploadForm, setUploadForm] = useState({
    file: null,
    category: 'OTHER',
    name: '',
  });

  const documentCategories = [
    { value: 'AADHAR', label: 'Aadhar Card' },
    { value: 'PAN', label: 'PAN Card' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'DRIVING_LICENSE', label: 'Driving License' },
    { value: 'RESUME', label: 'Resume/CV' },
    { value: 'PHOTO', label: 'Photograph' },
    { value: 'EDUCATIONAL', label: 'Educational Certificate' },
    { value: 'EXPERIENCE', label: 'Experience Letter' },
    { value: 'SALARY_SLIP', label: 'Salary Slip' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${employeeId}/documents`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }
      setUploadForm({ ...uploadForm, file, name: file.name });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      showError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('category', uploadForm.category);
      formData.append('name', uploadForm.name);

      const res = await api.post(`/employees/${employeeId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      success('Document uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ file: null, category: 'OTHER', name: '' });
      fetchDocuments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}/documents/${docId}`);
      success('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      showError('Failed to delete document');
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    // Open file in new tab (Cloudinary URLs are direct access)
    window.open(fileUrl, '_blank');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryLabel = (category) => {
    const cat = documentCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Documents</h3>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload size={18} className="mr-2" /> Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No documents uploaded yet</p>
            <Button variant="secondary" onClick={() => setShowUploadModal(true)} className="mt-4">
              <Upload size={18} className="mr-2" /> Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{getCategoryLabel(doc.category)}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc.fileUrl, doc.name)}
                    title="View/Download"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Document" size="lg">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Allowed: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX (Max 5MB)
            </p>
          </div>

          <Select
            label="Document Category *"
            options={documentCategories}
            value={uploadForm.category}
            onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
            required
          />

          <Input
            label="Document Name *"
            value={uploadForm.name}
            onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
            placeholder="e.g., Aadhar Card - Front"
            required
          />

          {uploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !uploadForm.file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default DocumentsSection;