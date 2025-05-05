package backend.PostManagement.controller;

import backend.exception.ResourceNotFoundException; // Import for custom exception
import backend.PostManagement.model.Comment; // Import for Comment model
import backend.Notification.model.NotificationModel; // Import for Notification model
import backend.PostManagement.model.PostManagementModel; // Import for Post model
import backend.Notification.repository.NotificationRepository; // Import for Notification repository
import backend.PostManagement.repository.PostManagementRepository; // Import for Post repository
import backend.User.repository.UserRepository; // Import for User repository
import org.springframework.beans.factory.annotation.Autowired; // Import for Spring autowiring
import org.springframework.beans.factory.annotation.Value; // Import for reading properties
import org.springframework.http.HttpStatus; // Import for HTTP status codes
import org.springframework.http.ResponseEntity; // Import for ResponseEntity
import org.springframework.util.StringUtils; // Import for String utilities
import org.springframework.web.bind.annotation.*; // Import for Spring MVC annotations
import org.springframework.web.multipart.MaxUploadSizeExceededException; // Import for file size exception
import org.springframework.web.multipart.MultipartFile; // Import for handling file uploads

import java.io.File; // Import for File handling
import java.io.IOException; // Import for IO exceptions
import java.nio.file.Files; // Import for file operations
import java.nio.file.Path; // Import for Path operations
import java.nio.file.Paths; // Import for Paths utility
import java.time.LocalDateTime; // Import for date/time handling
import java.time.format.DateTimeFormatter; // Import for date formatting
import java.util.List; // Import for List collection
import java.util.Map; // Import for Map collection
import java.util.UUID; // Import for UUID generation
import java.util.stream.Collectors; // Import for stream operations

@RestController
@RequestMapping("/posts")
public class PostManagementController {
    @Autowired // Injects Post repository dependency
    private PostManagementRepository postRepository;

    @Autowired // Injects User repository dependency
    private UserRepository userRepository;

    @Autowired // Injects Notification repository dependency
    private NotificationRepository notificationRepository;

    @Value("${media.upload.dir}") // Injects media upload directory from properties
    private String uploadDir;

    @PostMapping // Handles POST requests to create a new post
    public ResponseEntity<?> createPost(
            @RequestParam String userID, // User ID parameter
            @RequestParam String title, // Post title parameter
            @RequestParam String description, // Post description parameter
            @RequestParam String category, // Post category parameter
            @RequestParam List<MultipartFile> mediaFiles) { // List of media files

        if (mediaFiles.size() < 1 || mediaFiles.size() > 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You must upload between 1 and 3 media files.");
        }

        // Resolve the upload directory as an absolute path
        final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);

        // Ensure the upload directory exists
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs();
            if (!created) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
            }
        }

        List<String> mediaUrls = mediaFiles.stream()
                .filter(file -> file.getContentType().matches("image/(jpeg|png|jpg)|video/mp4"))
                .map(file -> {
                    try {
                        // Generate a unique filename
                        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;

                        Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                        file.transferTo(filePath.toFile());
                        return "/media/" + uniqueFileName; // URL to access the file
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());

        PostManagementModel post = new PostManagementModel();
        post.setUserID(userID);
        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category); // Set category
        post.setMedia(mediaUrls);

        PostManagementModel savedPost = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @GetMapping
    public List<PostManagementModel> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/user/{userID}")
    public List<PostManagementModel> getPostsByUser(@PathVariable String userID) {
        return postRepository.findAll().stream()
                .filter(post -> post.getUserID().equals(userID))
                .collect(Collectors.toList());
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        // Delete associated media files
        for (String mediaUrl : post.getMedia()) {
            try {
                // Resolve the full file path
                Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete media file: " + mediaUrl);
            }
        }

        // Delete the post from the database
        postRepository.deleteById(postId);
        return ResponseEntity.ok("Post deleted successfully!");
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category, // Include category parameter
            @RequestParam(required = false) List<MultipartFile> newMediaFiles) {

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category); // Update category

        if (newMediaFiles != null && !newMediaFiles.isEmpty()) {
            // Ensure the upload directory exists
            final File uploadDirectory = new File(uploadDir.isBlank() ? uploadDir : System.getProperty("user.dir"), uploadDir);
            if (!uploadDirectory.exists()) {
                boolean created = uploadDirectory.mkdirs();
                if (!created) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create upload directory.");
                }
            }

            List<String> newMediaUrls = newMediaFiles.stream()
                    .map(file -> {
                        try {
                            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                            String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;
                            Path filePath = uploadDirectory.toPath().resolve(uniqueFileName);
                            file.transferTo(filePath.toFile());
                            return "/media/" + uniqueFileName;
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
                        }
                    })
                    .collect(Collectors.toList());
            post.getMedia().addAll(newMediaUrls);
        }

        postRepository.save(post);
        return ResponseEntity.ok("Post updated successfully!");
    }

    @DeleteMapping("/{postId}/media")
    public ResponseEntity<?> deleteMedia(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String mediaUrl = request.get("mediaUrl");

        PostManagementModel post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getMedia().remove(mediaUrl)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Media file not found in post.");
        }

        try {
            Path filePath = Paths.get(uploadDir, mediaUrl.replace("/media/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete media file.");
        }

        postRepository.save(post);
        return ResponseEntity.ok("Media file deleted successfully!");
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<PostManagementModel> likePost(@PathVariable String postId, @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getLikes().put(userID, !post.getLikes().getOrDefault(userID, false));
                    postRepository.save(post);

                    // Create a notification for the post owner
                    if (!userID.equals(post.getUserID())) {
                        String userFullName = userRepository.findById(userID)
                                .map(user -> user.getFullname())
                                .orElse("Someone");
                        String message = String.format("%s liked your %s post", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostManagementModel> addComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    Comment comment = new Comment();
                    comment.setId(UUID.randomUUID().toString());
                    comment.setUserID(userID);
                    comment.setContent(content);

                    // Fetch user's full name
                    String userFullName = userRepository.findById(userID)
                            .map(user -> user.getFullname())
                            .orElse("Anonymous");
                    comment.setUserFullName(userFullName);

                    post.getComments().add(comment);
                    postRepository.save(post);

                    // Create a notification for the post owner
                    if (!userID.equals(post.getUserID())) {
                        String message = String.format("%s commented on your post: %s", userFullName, post.getTitle());
                        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        NotificationModel notification = new NotificationModel(post.getUserID(), message, false, currentDateTime);
                        notificationRepository.save(notification);
                    }

                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        String userID = request.get("userID");
        String content = request.get("content");

        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().stream()
                            .filter(comment -> comment.getId().equals(commentId) && comment.getUserID().equals(userID))
                            .findFirst()
                            .ifPresent(comment -> comment.setContent(content));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<PostManagementModel> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userID) {
        return postRepository.findById(postId)
                .map(post -> {
                    post.getComments().removeIf(comment ->
                            comment.getId().equals(commentId) &&
                                    (comment.getUserID().equals(userID) || post.getUserID().equals(userID)));
                    postRepository.save(post);
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("File size exceeds the maximum limit!");
    }
}
