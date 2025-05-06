package backend.PostManagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

@Document(collection = "posts") // Specifies MongoDB collection name
public class PostManagementModel {
    @Id // Marks this field as the document identifier
    private String id; // Unique identifier for the post
    private String userID; // ID of the user who created the post
    private String title; // Title of the post
    private String description; // Description/content of the post
    private List<String> media; // List of media URLs associated with the post
    private Map<String, Boolean> likes = new HashMap<>(); // Map to store user likes (userID -> like status)
    private List<Comment> comments = new ArrayList<>(); // List to store comments on the post
    private String category; // Category of the post

    public PostManagementModel(String id, String userID, String title, String description, List<String> media) {
        this.id = id;
        this.userID = userID;
        this.title = title;
        this.description = description;
        this.media = media;
    }

    public PostManagementModel() {

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMedia() {
        return media;
    }

    public void setMedia(List<String> media) {
        this.media = media;
    }

    public Map<String, Boolean> getLikes() {
        return likes;
    }

    public void setLikes(Map<String, Boolean> likes) {
        this.likes = likes;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
