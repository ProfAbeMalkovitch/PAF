package backend.PostManagement.model;

public class Comment {
    private String id;               // Unique identifier for the comment
    private String userID;           // ID of the user who made the comment
    private String userFullName;     // Full name of the user who made the comment
    private String content;          // The actual comment content/text

    // Getter for comment ID
    public String getId() {
        return id;
    }

    // Setter for comment ID
    public void setId(String id) {
        this.id = id;
    }

    // Getter for user ID
    public String getUserID() {
        return userID;
    }

    // Setter for user ID
    public void setUserID(String userID) {
        this.userID = userID;
    }

    // Getter for user's full name
    public String getUserFullName() {
        return userFullName;
    }

    // Setter for user's full name
    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    // Getter for comment content
    public String getContent() {
        return content;
    }

    // Setter for comment content
    public void setContent(String content) {
        this.content = content;
    }
}
