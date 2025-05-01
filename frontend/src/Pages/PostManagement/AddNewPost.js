import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024;

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (files) => {
    const maxFileSize = 50 * 1024 * 1024;

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <NavBar />
      <div style={{
        maxWidth: '900px',
        margin: '8rem auto',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#2e7d32',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600'
        }}>Create New Post</h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#2e7d32',
                fontWeight: '500'
              }}>Title</label>
              <input
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #81c784',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                type="text"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#2e7d32',
                fontWeight: '500'
              }}>Category</label>
              <select
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #81c784',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  outline: 'none'
                }}
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
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

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2e7d32',
              fontWeight: '500'
            }}>Description</label>
            <textarea
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #81c784',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                outline: 'none',
                minHeight: '120px',
                resize: 'vertical'
              }}
              placeholder="Write your post content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2e7d32',
              fontWeight: '500'
            }}>Media</label>
            <div
              style={{
                border: '2px dashed #81c784',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <p style={{ color: '#2e7d32', marginBottom: '10px' }}>
                Drag and drop files here or click to select
              </p>
              <p style={{ color: '#666', fontSize: '0.9em' }}>
                Max: 3 images (50MB each) or 1 video (30s)
              </p>
              <input
                id="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/jpg,video/mp4"
                multiple
                onChange={(e) => handleFiles(Array.from(e.target.files))}
                style={{ display: 'none' }}
              />
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {mediaPreviews.map((preview, index) => (
                <div key={index} style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {preview.type.startsWith('video/') ? (
                    <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source src={preview.url} type={preview.type} />
                    </video>
                  ) : (
                    <img style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                         src={preview.url} alt={`Preview ${index}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.3s',
              marginTop: '20px'
            }}
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddNewPost;
