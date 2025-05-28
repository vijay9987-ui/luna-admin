import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://194.164.148.244:4066/api/products/getbanners');
      setBanners(res.data.banners);
      setMessage({ text: '', type: '' });
    } catch (err) {
      setMessage({ text: 'Failed to load banners', type: 'danger' });
      console.error('Error fetching banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files.length) {
      setMessage({ text: 'Please select at least one file', type: 'warning' });
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    setIsLoading(true);
    try {
      await axios.post('http://194.164.148.244:4066/api/products/uploadbanners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ text: 'Banners uploaded successfully!', type: 'success' });
      setFiles([]);
      fetchBanners();
    } catch (err) {
      setMessage({ text: 'Upload failed. ' + (err.response?.data?.message || ''), type: 'danger' });
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner group?')) return;

    setIsLoading(true);
    try {
      await axios.delete(`http://194.164.148.244:4066/api/products/deletebanner/${id}`);
      setMessage({ text: 'Banner deleted successfully', type: 'success' });
      fetchBanners();
    } catch (err) {
      setMessage({ text: 'Failed to delete banner', type: 'danger' });
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage Banners</h2>
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="mb-4 p-3 border rounded">
        <h4>Upload New Banners</h4>
        <div className="mb-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
            disabled={isLoading}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {files.length > 0 && (
              <span className="text-muted">
                {files.length} file(s) selected
              </span>
            )}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : 'Upload Banners'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h4>Existing Banners</h4>
        {isLoading && banners.length === 0 ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : banners.length === 0 ? (
          <div className="alert alert-info">No banners found</div>
        ) : (
          <div className="row">
            {banners.map((banner) => (
              <div className="col-md-6 mb-4" key={banner._id}>
                <div className="card">
                  <div className="card-body">
                    <div className="row g-2">
                      {banner.images.map((img, idx) => (
                        <div className="col-4" key={idx}>
                          <img
                            src={`http://194.164.148.244:4066${img}`}
                            alt={`Banner ${idx + 1}`}
                            className="img-fluid rounded shadow-sm"
                            style={{ 
                              objectFit: 'cover', 
                              height: '100px', 
                              width: '100%',
                              border: '1px solid #eee'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(banner._id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Deleting...' : 'Delete Banner Group'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBannerManager;