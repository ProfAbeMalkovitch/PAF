import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import { FaVideo, FaImage } from "react-icons/fa";
import './post.css';
import './Templates.css';  // Add this import
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isPreviewZoomed, setIsPreviewZoomed] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(true);
  const [showImageUploadInput, setShowImageUploadInput] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const validateImage = (file) => {
    setImageError('');
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('File must be an image');
      return false;
    }
    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateImage(file)) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (templateNum) => {
    setTemplateID(templateNum);
  };

  const renderImageUploadSection = () => (
    <div className="Auth_formGroup">
      <label className="Auth_label">Upload Image</label>
      {(imagePreview || existingImage) ? (
        <div 
          className={`image-preview-container ${isPreviewZoomed ? 'zoomed' : ''}`}
          onClick={() => setIsPreviewZoomed(!isPreviewZoomed)}
        >
          <div className="image-preview">
            <img 
              src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
              alt="Preview" 
              className="preview-image"
            />
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setImagePreview(null);
                setExistingImage('');
                setImageError('');
              }} 
              className="remove-image"
            >
              ×
            </button>
          </div>
          <span className="zoom-hint">Click to {isPreviewZoomed ? 'shrink' : 'zoom'}</span>
        </div>
      ) : (
        <div
          className={`drag-drop-area ${isDragging ? 'dragging' : ''} ${imageError ? 'error' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <FaImage className="upload-icon" />
          <p>Drag and drop an image here, or</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="file-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="browse-button">
            Browse Files
          </label>
          {imageError && <p className="error-message">{imageError}</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="modern-layout glass-theme">
      <NavBar />
      <div className="content-container">
        <div className="templates-section">
          <h2 className="section-title">Choose Template</h2>
          <div className="templates-grid">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`template-card ${templateID === num ? 'selected' : ''}`}
                onClick={() => setTemplateID(num)}
              >
                <div className={`template template-${num}`}>
                  <div className="template-header">
                    <span className="template-badge">Template {num}</span>
                    <h3 className="preview-title">{title || "Title Preview"}</h3>
                    <div className="date-category">
                      <span><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</span>
                      <span className="category-badge">{category}</span>
                    </div>
                  </div>
                  <div className="template-content">
                    <p className="preview-description">{description || "Description Preview"}</p>
                    <div className="tags-container">
                      {tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                    {(imagePreview || existingImage || contentURL) && (
                      <div className="media-preview">
                        {(imagePreview || existingImage) && (
                          <div className="image-container">
                            <img 
                              src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                              alt="Preview" 
                            />
                          </div>
                        )}
                        {contentURL && (
                          <div className="video-container">
                            <iframe
                              src={getEmbedURL(contentURL)}
                              title="Content Preview"
                              frameBorder="0"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-card glass-card">
            <h2 className="form-title">Update Learning Plan</h2>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-grid">
                <div className="form-section-group">
                  <h3 className="section-subtitle">Basic Information</h3>
                  <div className="form-row">
                    <div className="Auth_formGroup">
                      <label className="Auth_label">Title</label>
                      <input
                        className="Auth_input glass-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="Auth_formGroup">
                      <label className="Auth_label">Description</label>
                      <textarea
                        className="Auth_input glass-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="form-row two-columns">
                    <div className="Auth_formGroup">
                      <label className="Auth_label">Start Date</label>
                      <input
                        className="Auth_input glass-input"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="Auth_formGroup">
                      <label className="Auth_label">End Date</label>
                      <input
                        className="Auth_input glass-input"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-group">
                  <div className="form-row">
                    <div className="Auth_formGroup">
                      <label className="Auth_label">Category</label>
                      <select
                        className="Auth_input glass-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Backend Development">Backend Development</option>
                        <option value="Frontend Development">Frontend Development</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Database">Database</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Software Testing">Software Testing</option>
                        <option value="Version Control">Version Control</option>
                        <option value="Project Management">Project Management</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Game Development">Game Development</option>
                      </select>
                    </div>
                  </div>

                  <div className="media-section">
                    <div className="media-controls">
                      <button 
                        type="button" 
                        className={`media-btn ${showContentURLInput ? 'active' : ''}`}
                        onClick={() => setShowContentURLInput(!showContentURLInput)}
                      >
                        <FaVideo /> Add Video
                      </button>
                      <button 
                        type="button"
                        className={`media-btn ${showImageUploadInput ? 'active' : ''}`}
                        onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                      >
                        <FaImage /> Add Image
                      </button>
                    </div>
                    {showContentURLInput && (
                      <div className="Auth_formGroup">
                        <label className="Auth_label">Content URL</label>
                        <input
                          className="Auth_input glass-input"
                          type="url"
                          value={contentURL}
                          onChange={(e) => setContentURL(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {showImageUploadInput && renderImageUploadSection()}
                  </div>

                  <div className="tags-section">
                    <div className="Auth_formGroup">
                      <label className="Auth_label">Tags</label>
                      <div className='skil_dis_con'>
                        {tags.map((tag, index) => (
                          <p className='skil_name' key={index}>
                            #{tag} <span onClick={() => handleDeleteTag(index)} className='dlt_bnt'>x</span>
                          </p>
                        ))}
                      </div>
                      <div className='skil_addbtn'>
                        <input
                          className="Auth_input glass-input"
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                        />
                        <IoMdAdd onClick={handleAddTag} className="add_s_btn" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn glass-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading">Updating...</span>
                ) : (
                  <span>Update Learning Plan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;

// Add these styles to your post.css file
const styles = `
.glass-theme {
  background: linear-gradient(135deg, rgba(220, 255, 220, 0.1), rgba(220, 255, 220, 0.3));
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  padding: 2rem;
  margin: 1rem;
}

.glass-input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(5px);
  color: #333;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 0 10px rgba(146, 207, 146, 0.3);
}

.glass-button {
  background: rgba(146, 207, 146, 0.2) !important;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(146, 207, 146, 0.3) !important;
  transform: translateY(-2px);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-row {
  margin-bottom: 1.5rem;
}

.form-row.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.section-subtitle {
  color: #2c5c2c;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.templates-section {
  margin-bottom: 2rem;
}

.media-section, .tags-section {
  margin-top: 2rem;
}

.template-image {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 8px;
}

.template-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.template-preview {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
`;
