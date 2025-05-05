import React, { useState, useEffect } from 'react';// Import React and hooks
import { useParams } from 'react-router-dom'; // Import useParams to get route parameters
import NavBar from '../../Components/NavBar/NavBar';  // Import NavBar component

function UpdateLearningProgress() {  
  const { id } = useParams();  // Get the 'id' parameter from the URL
  const [formData, setFormData] = useState({// State to store form data
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);  // State for selected image file
  const [previewImage, setPreviewImage] = useState('');    // State for image preview URL
  const [isLoading, setIsLoading] = useState(false);       // State for loading status
  const [isDragging, setIsDragging] = useState(false);     // State for drag-and-drop status

  useEffect(() => {
    const fetchLearningProgress = async () => {  // Function to fetch learning progress data
      try {
        const response = await fetch(`http://localhost:8080/learningProgress/${id}`);// Fetch data by ID
        if (!response.ok) {
          throw new Error('Failed to fetch learning progress');// Throw error if fetch fails
        }
        const data = await response.json();//Parse JSON response
        setFormData(data);// Set fetched data to form state
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/learningProgress/images/${data.imageUrl}`);// Set preview image URL if image exists
        }
      } catch (error) {
        console.error('Error fetching Learning Progress data:', error);// Log error to console
        alert('Error loading learning progress data');// Alert user about the error
      }
    };
    fetchLearningProgress();// Call fetch function on component mount
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/learningProgress/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update learning progress data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/learningProgress/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Learning Progress updated successfully!');
        window.location.href = '/myLearningProgress';
      } else {
        throw new Error('Failed to update learning progress');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <NavBar/>
      <div style={{
        maxWidth: '800px',
        margin: '8rem auto',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#2e7d32',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600'
        }}>Update Learning Progress</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          {/* Image Upload Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2e7d32',
              fontWeight: '500'
            }}>Learning Progress Image</label>
            <div 
              className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #81c784',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(129, 199, 132, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer'
              }}
            >
              {previewImage ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={previewImage}
                    alt="Learning Progress Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage('');
                      setSelectedFile(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <p>Drag and drop an image here or</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="fileInput"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput').click()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Title Input */}
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
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #81c784',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  outline: 'none'
                }}
                name="title"
                placeholder="Enter learning progress title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category Select */}
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
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #81c784',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  outline: 'none'
                }}
                name="category"
                value={formData.category}
                onChange={handleInputChange}
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

            {/* Date Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#2e7d32',
                fontWeight: '500'
              }}>Date</label>
              <input
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #81c784',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  outline: 'none'
                }}
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Description Textarea */}
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
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #81c784',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                outline: 'none',
                minHeight: '120px',
                resize: 'vertical'
              }}
              name="description"
              placeholder="Describe your learning progress"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              backgroundColor: '#2e7d32',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.3s',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '20px'
            }}
          >
            {isLoading ? 'Updating...' : 'Update Learning Progress'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateLearningProgress;
