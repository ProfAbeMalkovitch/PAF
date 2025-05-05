package backend.User.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "user") // Marks this class as a MongoDB document mapped to 'user' collection
public class UserModel {
    @Id // Marks this field as the document identifier
    @GeneratedValue // Indicates the ID should be automatically generated
    private String id; // Unique identifier for the user
    private String fullname; // User's full name
    private String email; // User's email address
    private String password; // User's password (should be encrypted)
    private String phone; // User's phone number
    private String profilePicturePath; // Path to locally stored profile picture
    private String googleProfileImage; // URL to Google profile image if using Google auth
    private Set<String> followedUsers = new HashSet<>(); // Set of user IDs this user follows
    private Set<String> skills = new HashSet<>(); // Set of skills associated with the user
    private String bio; // User's biography or description

    public UserModel() {} // Default constructor

    // Parameterized constructor for creating a new UserModel instance
    public UserModel(String id, String fullname, String email, String password, String phone, String profilePicturePath, String googleProfileImage) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.profilePicturePath = profilePicturePath;
        this.googleProfileImage = googleProfileImage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getProfilePicturePath() {
        return profilePicturePath;
    }

    public void setProfilePicturePath(String profilePicturePath) {
        this.profilePicturePath = profilePicturePath;
    }

    public String getGoogleProfileImage() {
        return googleProfileImage;
    }

    public void setGoogleProfileImage(String googleProfileImage) {
        this.googleProfileImage = googleProfileImage;
    }

    public Set<String> getFollowedUsers() {
        return followedUsers;
    }

    public void setFollowedUsers(Set<String> followedUsers) {
        this.followedUsers = followedUsers;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
