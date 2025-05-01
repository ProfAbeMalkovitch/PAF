import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';

function AddLearningProgress() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleDragEnter = (e) => {
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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert('Please upload an image file');
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        try {
          const uploadResponse = await fetch('http://localhost:8080/learningProgress/upload', {
            method: 'POST',
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
          }
          imageUrl = await uploadResponse.text();
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const response = await fetch('http://localhost:8080/learningProgress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl }),
      });

      if (response.ok) {
        alert('Learning Progress added successfully!');
        window.location.href = '/myLearningProgress';
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add Learning Progress. Please check your connection and try again.');
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer glass-container">
            <p className="Auth_heading">Add Learning Progress</p>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
                setFormData({
                  title: '',
                  description: '',
                  date: '',
                  category: '',
                  postOwnerID: formData.postOwnerID,
                  postOwnerName: formData.postOwnerName,
                });
                setImage(null);
                setImagePreview(null);
              }}
              className='from_data'
            >
              <div className="Auth_formGroup">
                <label className="Auth_label">Upload Image</label>
                <div
                  className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview-achi" />
                      <button 
                        className="remove-image" 
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="drag-drop-text">
                      <svg className="upload-icon" viewBox="0 0 24 24">
                        <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                      </svg>
                      <p>Drag and drop an image here or</p>
                      <label className="file-input-label">
                        Choose File
                        <input
                          className="file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                        />
                      </label>
                      <p className="file-hint">Supported formats: JPG, PNG, GIF</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <input
                  className="Auth_input"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <textarea
                  className="Auth_input"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
              <div className="Auth_formGroup">
                <label className="Auth_label">Date</label>
                <input
                  className="Auth_input"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="Auth_button">Add</button>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`
        .continSection {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, rgba(144, 238, 144, 0.1), rgba(152, 251, 152, 0.1));
        }

        .glass-container {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          padding: 2rem;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .Auth_heading {
          color: #2c5834;
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          font-weight: bold;
        }

        .Auth_formGroup {
          margin-bottom: 1.5rem;
        }

        .Auth_label {
          color: #2c5834;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .Auth_input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid rgba(144, 238, 144, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }

        .Auth_input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }

        .Auth_button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .Auth_button:hover {
          background: linear-gradient(135deg, #45a049, #3d8b40);
          transform: translateY(-2px);
        }

        .drag-drop-area {
          background: rgba(255, 255, 255, 0.15);
          border: 2px dashed rgba(76, 175, 80, 0.4);
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drag-drop-area.dragging {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.1);
        }

        .drag-drop-text {
          color: #666;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          fill: #999;
          margin-bottom: 10px;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin: 10px 0;
          display: inline-block;
        }

        .file-hint {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }

        .image-preview-container {
          position: relative;
          max-width: 100%;
        }

        .remove-image {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .image-preview-container img {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default AddLearningProgress;
