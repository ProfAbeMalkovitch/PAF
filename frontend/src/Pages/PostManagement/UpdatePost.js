import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './UpdatePost.css';

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [loading, setLoading] = useState(true); // Add loading state
  const [mediaPreviews, setMediaPreviews] = useState([]);

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  const handleNewMediaChange = async (e) => {
    e.preventDefault();
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const maxFileSize = 50 * 1024 * 1024;
    let imageCount = existingMedia.filter(url => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter(url => url.endsWith('.mp4')).length;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        if (imageCount >= 3) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
        imageCount++;
        previews.push({ type: file.type, url: URL.createObjectURL(file) });
      } else if (file.type === 'video/mp4') {
        if (videoCount >= 1) {
          alert('You can upload only 1 video.');
          return;
        }
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            return;
          }
          videoCount++;
          previews.push({ type: file.type, url: URL.createObjectURL(file) });
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    setNewMedia(prev => [...prev, ...files]);
    setMediaPreviews(prev => [...prev, ...previews]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // Include category in the update
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading message while fetching data
  }

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="update_post_container">
            <h1 className="Auth_heading">Update Post</h1>
            <form onSubmit={handleSubmit} className='from_data'>
              <div className="form_section">
                <div className="Auth_formGroup">
                  <label className="Auth_label">Title</label>
                  <input
                    className="Auth_input"
                    type="text"
                    placeholder="Enter post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="Auth_formGroup">
                  <label className="Auth_label">Category</label>
                  <select
                    className="Auth_input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a category</option>
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

              <div className="form_section">
                <div className="Auth_formGroup description_group">
                  <label className="Auth_label">Description</label>
                  <textarea
                    className="Auth_input"
                    placeholder="Write your post description here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
              </div>

              <div className="form_section">
                <div className="Auth_formGroup">
                  <label className="Auth_label">Media Files</label>
                  <div className="media_section">
                    <div
                      className="media_upload_zone"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleNewMediaChange}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <i className="upload-icon">📁</i>
                      <p>Drag and drop files here or click to select</p>
                      <p className="upload-hint">Max: 3 images (50MB each) or 1 video (30s)</p>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,video/mp4"
                        multiple
                        onChange={handleNewMediaChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="media_previews">
                      {existingMedia.map((mediaUrl, index) => (
                        <div key={`existing-${index}`} className="media_preview_item">
                          {mediaUrl.endsWith('.mp4') ? (
                            <video controls className='media_file_se'>
                              <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            </video>
                          ) : (
                            <img className='media_file_se' src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                          )}
                          <button className="delete-btn" onClick={() => handleDeleteMedia(mediaUrl)}>×</button>
                        </div>
                      ))}
                      {mediaPreviews.map((preview, index) => (
                        <div key={`preview-${index}`} className="media_preview_item">
                          {preview.type.startsWith('video/') ? (
                            <video controls className='media_file_se'>
                              <source src={preview.url} type={preview.type} />
                            </video>
                          ) : (
                            <img className='media_file_se' src={preview.url} alt={`Preview ${index}`} />
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              URL.revokeObjectURL(preview.url);
                              setMediaPreviews(prev => prev.filter((_, i) => i !== index));
                              setNewMedia(prev => prev.filter((_, i) => i !== index));
                            }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form_actions">
                <button type="submit" className="Auth_button">Update Post</button>
                <button type="button" className="Auth_button_secondary" onClick={() => navigate('/allPost')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;
