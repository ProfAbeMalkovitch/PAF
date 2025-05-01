import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar'
import { IoIosCreate } from "react-icons/io";

function MyLearningProgress() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false); // Track filter mode
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/learningProgress')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((progress) => progress.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching Learning Progress data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Learning Progress?')) {
      try {
        const response = await fetch(`http://localhost:8080/learningProgress/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Learning Progress deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Learning Progress.');
        }
      } catch (error) {
        console.error('Error deleting Learning Progress:', error);
      }
    }
  };

  return (
    <div className="app-background">
      <div className='container'>
        <NavBar />
        <div className='content-section'>
          <div className='add-new-btn glass-effect' onClick={() => (window.location.href = '/addLearningProgress')}>
            <IoIosCreate className='add-new-btn-icon' />
          </div>
          <div className='post-card-container'>
            {filteredData.length === 0 ? (
              <div className='not-found-box glass-effect'>
                <div className='not-found-img'></div>
                <p className='not-found-msg'>No posts found. Please create a new post.</p>
                <button
                  className='create-post-btn glass-effect'
                  onClick={() => (window.location.href = '/addLearningProgress')}
                >
                  Create New Post
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className='post-card glass-effect'>
                  <div className='user-details-card'>
                    <div className='name-section'>
                      <p className='owner-name'>{progress.postOwnerName}</p>
                      <p className='post-date'>{progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className='action-buttons'>
                        <FaEdit
                          onClick={() => (window.location.href = `/updateLearningProgress/${progress.id}`)}
                          className='action-icon'
                        />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(progress.id)}
                          className='action-icon'
                        />
                      </div>
                    )}
                  </div>
                  <div className='post-content'>
                    <h2 className='post-title'>{progress.title}</h2>
                    <p className='post-description'>{progress.description}</p>
                    {progress.imageUrl && (
                      <img
                        src={`http://localhost:8080/learningProgress/images/${progress.imageUrl}`}
                        alt="Learning Progress"
                        className='post-image'
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <style jsx>{`
            .app-background {
              min-height: 100vh;
              background: linear-gradient(135deg, rgba(204, 255, 204, 0.4), rgba(179, 255, 179, 0.3));
            }

            .glass-effect {
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(10px);
              border-radius: 15px;
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .content-section {
              max-width: 1200px;
              margin: 20px auto;
              padding: 20px;
            }

            .post-card-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              padding: 20px;
              margin-top: 5rem;
            }

            .post-card {
              padding: 20px;
              transition: transform 0.2s;
            }

            .post-card:hover {
              transform: translateY(-5px);
            }

            .user-details-card {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }

            .name-section {
              flex: 1;
            }

            .owner-name {
              font-size: 1.1rem;
              font-weight: 600;
              color: #2e7d32;
              margin: 0;
            }

            .post-date {
              font-size: 0.9rem;
              color: #666;
              margin: 5px 0;
            }

            .action-buttons {
              display: flex;
              gap: 10px;
            }

            .action-icon {
              cursor: pointer;
              font-size: 1.2rem;
              color: #2e7d32;
              transition: color 0.2s;
            }

            .action-icon:hover {
              color: #1b5e20;
            }

            .post-content {
              margin-top: 15px;
            }

            .post-title {
              color: #1b5e20;
              margin: 0 0 10px 0;
              font-size: 1.4rem;
            }

            .post-description {
              color: #333;
              line-height: 1.6;
              margin-bottom: 15px;
            }

            .post-image {
              width: 100%;
              border-radius: 10px;
              margin-top: 10px;
            }

            .add-new-btn {
              position: fixed;
              bottom: 30px;
              right: 30px;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              background: #2e7d32;
              color: white;
              font-size: 24px;
              transition: transform 0.2s;
            }

            .add-new-btn:hover {
              transform: scale(1.1);
            }

            .not-found-box {
              text-align: center;
              padding: 40px;
              margin: 40px auto;
              max-width: 400px;
            }

            .create-post-btn {
              background: #2e7d32;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 25px;
              cursor: pointer;
              font-size: 1rem;
              transition: transform 0.2s;
            }

            .create-post-btn:hover {
              transform: scale(1.05);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default MyLearningProgress;
