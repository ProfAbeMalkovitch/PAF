import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isPreviewZoomed, setIsPreviewZoomed] = useState(false);

  const validateImage = (file) => {
    setImageError('');
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError('File must be an image');
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
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

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
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
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div className="modern-layout">
      <NavBar />
      <div className="content-container">
        <div className="templates-section">
          <h2 className="section-title">Choose Template</h2>
          <div className="templates-grid">
            <div className={`template-card ${templateID === '1' ? 'selected' : ''}`} 
                 onClick={() => setTemplateID('1')}>
              <div className="template template-1">
                <div className="template-header">
                  <span className="template-badge">Template 1</span>
                  <h3 className="preview-title">{title || "Title Preview"}</h3>
                  <div className="date-category">
                    <span><HiCalendarDateRange /> {startDate} to {endDate}</span>
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
                  {(imagePreview || contentURL) && (
                    <div className="media-preview">
                      {imagePreview && (
                        <div className="image-container">
                          <img src={imagePreview} alt="Preview" />
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

            <div className={`template-card ${templateID === '2' ? 'selected' : ''}`} 
                 onClick={() => setTemplateID('2')}>
              <div className="template template-2">
                <div className="template-header">
                  <span className="template-badge">Template 2</span>
                  <h3 className="preview-title">{title || "Title Preview"}</h3>
                  <div className="date-category">
                    <span><HiCalendarDateRange /> {startDate} to {endDate}</span>
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
                  {(imagePreview || contentURL) && (
                    <div className="media-preview">
                      {imagePreview && (
                        <div className="preview-part">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                      {contentURL && (
                        <div className="preview-part">
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

            <div className={`template-card ${templateID === '3' ? 'selected' : ''}`} 
                 onClick={() => setTemplateID('3')}>
              <div className="template template-3">
                <div className="template-header">
                  <span className="template-badge">Template 3</span>
                  <h3 className="preview-title">{title || "Title Preview"}</h3>
                  <div className="date-category">
                    <span><HiCalendarDateRange /> {startDate} to {endDate}</span>
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
                  <div className="media-preview">
                    {imagePreview && <img src={imagePreview} alt="Preview" />}
                    {contentURL && (
                      <iframe
                        src={getEmbedURL(contentURL)}
                        title="Content Preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2 className="form-title">Create Learning Plan</h2>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-section-group">
                <h3 className="section-subtitle">Basic Information</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Enter description"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
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

              <div className="form-section-group">
                <h3 className="section-subtitle">Timeline</h3>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section-group">
                <h3 className="section-subtitle">Tags</h3>
                <div className="form-group">
                  <div className="tags-input-container">
                    <div className="tags-display">
                      {tags.map((tag, index) => (
                        <span key={index} className="tag-pill">
                          #{tag}
                          <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== index))}>×</button>
                        </span>
                      ))}
                    </div>
                    <div className="tag-input-wrapper">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                      />
                      <button type="button" onClick={handleAddTag} className="add-tag-btn">
                        <IoMdAdd />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-group">
                <h3 className="section-subtitle">Media</h3>
                <div className="media-controls">
                  <button type="button" 
                          className={`media-btn ${showContentURLInput ? 'active' : ''}`}
                          onClick={() => setShowContentURLInput(!showContentURLInput)}>
                    <FaVideo /> Add Video
                  </button>
                  <button type="button"
                          className={`media-btn ${showImageUploadInput ? 'active' : ''}`}
                          onClick={() => setShowImageUploadInput(!showImageUploadInput)}>
                    <FaImage /> Add Image
                  </button>
                </div>

                {showContentURLInput && (
                  <div className="form-group">
                    <label>Content URL</label>
                    <input
                      type="url"
                      value={contentURL}
                      onChange={(e) => setContentURL(e.target.value)}
                      placeholder="Enter content URL"
                    />
                  </div>
                )}

                {showImageUploadInput && (
                  <div className="form-group">
                    <label>Upload Image</label>
                    {imagePreview ? (
                      <div className={`image-preview-container ${isPreviewZoomed ? 'zoomed' : ''}`}
                           onClick={() => setIsPreviewZoomed(!isPreviewZoomed)}>
                        <div className="image-preview">
                          <img 
                            src={imagePreview} 
                            alt="Preview"
                            onError={() => {
                              setImageError('Error loading image');
                              setImagePreview(null);
                              setImage(null);
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setImage(null);
                              setImagePreview(null);
                              setImageError('');
                            }} 
                            className="remove-image"
                          >×</button>
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
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading">Submitting...</span>
                ) : (
                  <span>Create Learning Plan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;