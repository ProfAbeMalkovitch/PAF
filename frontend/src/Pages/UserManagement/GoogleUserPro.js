import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import './GoogleUserPro.css'
import Pro from './img/img.png';
import NavBar from '../../Components/NavBar/NavBar';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function GoogleUserPro() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);

    const loadUserData = async () => {
        try {
            const userId = localStorage.getItem('userID');
            const userType = localStorage.getItem('userType');
            
            if (!userId) return;
            
            setUserType(userType);
            const data = await fetchUserDetails(userId);
            
            if (data) {
                setUserData(data);
                if (userType === 'google') {
                    setGoogleProfileImage(localStorage.getItem('googleProfileImage'));
                } else if (data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const handleDelete = async () => {
        try {
            if (!window.confirm("Are you sure you want to delete your profile?")) return;
            
            const userId = localStorage.getItem('userID');
            const response = await fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                localStorage.removeItem('userID');
                alert("Profile deleted successfully!");
                navigate('/');
            } else {
                throw new Error('Failed to delete profile');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert("Failed to delete profile.");
        }
    };

    if (!userData) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <NavBar />
            <div className="content-wrapper">
                {userData?.id === localStorage.getItem('userID') && (
                    <div className='two-row-layout'>
                        <div className="profile-row">
                            <div className="profile-card">
                                <div className="profile-left">
                                    <img
                                        src={
                                            googleProfileImage
                                                ? googleProfileImage
                                                : userProfileImage
                                                    ? userProfileImage
                                                    : Pro
                                        }
                                        alt="Profile"
                                        className="profile-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = Pro;
                                        }}
                                    />
                                    <div className="profile-actions">
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
                                        <div className='link-card-content'>
                                            <div className='card-icon learning-icon'></div>
                                            <div className='card-text'>
                                                <h3 className='card-title'>Learning Plan</h3>
                                                <p className='card-description'>View and manage your learning journey</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='link-card' onClick={() => navigate('/myAllPost')}>
                                        <div className='link-card-content'>
                                            <div className='card-icon posts-icon'></div>
                                            <div className='card-text'>
                                                <h3 className='card-title'>Skill Posts</h3>
                                                <p className='card-description'>Browse your shared skills and experiences</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='link-card' onClick={() => navigate('/myAchievements')}>
                                        <div className='link-card-content'>
                                            <div className='card-icon achievements-icon'></div>
                                            <div className='card-text'>
                                                <h3 className='card-title'>Achievements</h3>
                                                <p className='card-description'>Track your milestones and successes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GoogleUserPro;
