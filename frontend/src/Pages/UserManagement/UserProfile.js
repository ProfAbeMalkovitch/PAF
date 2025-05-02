import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools } from 'react-icons/fa';
import './UserProfile.css'
import NavBar from '../../Components/NavBar/NavBar';
export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    return (
        <div>
            <div className='container' >
                <NavBar />
                <div className='content-wrapper'>
                    {userData && userData.id === localStorage.getItem('userID') && (
                        <div className='two-row-layout'>
                            <div className="profile-row">
                                <div className="profile-card">
                                    <div className="profile-left">
                                        {userData.profilePicturePath && (
                                            <img
                                                src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                                alt="Profile"
                                                className="profile-image"
                                            />
                                        )}
                                        <div className="profile-actions">
                                            <button onClick={() => navigate(`/updateUserProfile/${userData.id}`)} className="update-button">
                                                Update Profile
                                            </button>
                                            <button onClick={handleDelete} className="delete-button">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className='profile-right'>
                                        <div className='user-info-card'>
                                            <div className='header-section'>
                                                <h1 className='username-title'>{userData.fullname}</h1>
                                            </div>
                                            <div className='info-sections-container'>
                                                <div className='main-info'>
                                                    <div className='bio-section'>
                                                        <h3 className='section-title'>About Me</h3>
                                                        <p className='bio-text'>{userData.bio}</p>
                                                    </div>
                                                </div>
                                                <div className='side-info'>
                                                    <div className='contact-section'>
                                                        <h3 className='section-title'>Contact Information</h3>
                                                        <div className='contact-info'>
                                                            <div className='info-item'>
                                                                <FaEnvelope className='info-icon' />
                                                                <span>{userData.email}</span>
                                                            </div>
                                                            <div className='info-item'>
                                                                <FaPhone className='info-icon' />
                                                                <span>{userData.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='skills-section'>
                                                        <h3 className='section-title'>Skills</h3>
                                                        <div className='skills-container'>
                                                            {userData.skills.map((skill, index) => (
                                                                <span key={index} className='skill-tag'>{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dashboard-row">
                                <div className='dashboard-links'>
                                    <div className='link-grid'>
                                        <div className='link-card' onClick={() => navigate('/myLearningPlan')}>
                                            <div className='card-icon learning-icon'></div>
                                            <h3 className='card-title'>Learning Plan</h3>
                                            <p className='card-description'>View and manage your learning journey</p>
                                        </div>
                                        <div className='link-card' onClick={() => navigate('/myAllPost')}>
                                            <div className='card-icon posts-icon'></div>
                                            <h3 className='card-title'>Skill Posts</h3>
                                            <p className='card-description'>Browse your shared skills and experiences</p>
                                        </div>
                                        <div className='link-card' onClick={() => navigate('/myLearningProgress')}>
                                            <div className='card-icon achievements-icon'></div>
                                            <h3 className='card-title'>Learning Progress</h3>
                                            <p className='card-description'>Track your learning journey progress</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
