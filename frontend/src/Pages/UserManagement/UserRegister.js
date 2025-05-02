import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png'
import { IoMdAdd } from "react-icons/io";
import './user.css';
function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '', // Added bio field
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return; // Stop execution if validation fails
        }

        try {
            // Step 1: Create the user
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio, // Include bio in the request
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id; // Get the user ID from the response

                // Step 2: Upload the profile picture
                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email); // Send verification code
                setIsVerificationModalOpen(true); // Open verification modal
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="Auth_container glass_container">
            <div className="Auth_card">
                <div className="register_header">
                    <h1 className="brand_name">DevLink</h1>
                    <p className="Auth_heading">Create your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="Auth_form">
                    <div className="profile_section">
                        <div className="profile-icon-container" onClick={triggerFileInput}>
                            {previewImage ? (
                                <img src={previewImage} alt="Selected Profile" className="selectedimagepreview"/>
                            ) : (
                                <div className="upload_placeholder">
                                    <FaUserCircle className="profileicon" />
                                    <span>Upload Photo</span>
                                </div>
                            )}
                        </div>
                        <input id="profilePictureInput" className="hidden-input" type="file" accept="image/*" onChange={handleProfilePictureChange}/>
                    </div>

                    <div className="form_grid">
                        <div className="Auth_formGroup">
                            <label className="Auth_label">Full Name</label>
                            <input className="Auth_input" type="text" name="fullname" placeholder="Enter your full name" value={formData.fullname} onChange={handleInputChange} required/>
                        </div>
                        <div className="Auth_formGroup">
                            <label className="Auth_label">Email Address</label>
                            <input className="Auth_input" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} required/>
                        </div>
                        <div className="Auth_formGroup">
                            <label className="Auth_label">Password</label>
                            <input className="Auth_input" type="password" name="password" placeholder="Create password" value={formData.password} onChange={handleInputChange} required/>
                        </div>
                        <div className="Auth_formGroup">
                            <label className="Auth_label">Phone</label>
                            <input className="Auth_input" type="text" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={(e) => {const re = /^[0-9\b]{0,10}$/; if (re.test(e.target.value)) {handleInputChange(e);}}} maxLength="10" pattern="[0-9]{10}" required/>
                        </div>
                    </div>

                    <div className="skills_section">
                        <label className="Auth_label">Skills <span className="skills_hint">(Add at least 2 skills)</span></label>
                        <div className='skill_input_container'>
                            <input 
                                className="Auth_input skill_input" 
                                type="text" 
                                placeholder="Type a skill and press enter" 
                                value={skillInput} 
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            />
                            <button type="button" className="add_skill_btn" onClick={handleAddSkill}>
                                <IoMdAdd />
                            </button>
                        </div>
                        <div className='skills_list'>
                            {formData.skills.map((skill, index) => (
                                <span className='skill_tag' key={index}>{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="Auth_formGroup">
                        <label className="Auth_label">Bio</label>
                        <textarea 
                            className="Auth_input bio_input" 
                            name="bio" 
                            placeholder="Tell us about yourself..." 
                            value={formData.bio} 
                            rows={3} 
                            onChange={handleInputChange} 
                            required
                        />
                    </div>

                    <div className="form_actions">
                        <button type="submit" className="Auth_button">Create Account</button>
                        <div className="divider">
                            <span>OR</span>
                        </div>
                        <button type="button" onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'} className="Auth_googleButton">
                            <img src={GoogalLogo} alt='glogo' className='glogo' />
                            Continue with Google
                        </button>
                        <p className="Auth_signupPrompt">
                            Already have an account? <span onClick={() => (window.location.href = '/')} className="Auth_signupLink">Sign in</span>
                        </p>
                    </div>
                </form>
            </div>
            {isVerificationModalOpen && (
                <div className="verification-modal">
                    <div className="modal-content">
                        <p className='veryname'>Verify Your Email</p>
                        <p>Please enter the verification code sent to your email.</p>
                        <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            placeholder="Enter verification code"
                            className="verification-input"
                        />
                        <button onClick={handleVerifyCode} className="verification-button">Verify</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
