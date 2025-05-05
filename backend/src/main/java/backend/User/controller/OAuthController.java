package backend.User.controller;

import backend.User.model.UserModel;
import backend.User.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
public class OAuthController {

    @Autowired
    private UserRepository userRepository; // Injects UserRepository dependency

    @GetMapping("/oauth2/success")
    public RedirectView handleGoogleLogin(Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal(); // Gets OAuth2 user principal
        Map<String, Object> attributes = oAuth2User.getAttributes(); // Gets user attributes from OAuth
        String email = (String) attributes.get("email"); // Extracts email from attributes
        String name = (String) attributes.get("name"); // Extracts name from attributes
        String googleProfileImage = (String) attributes.get("picture"); // Retrieves Google profile image URL

        // Encode the Google profile image URL for safe URL transmission
        String encodedGoogleProfileImage = URLEncoder.encode(googleProfileImage, StandardCharsets.UTF_8);

        UserModel user;
        // Check if user already exists in database
        if (!userRepository.existsByEmail(email)) {
            user = new UserModel(); // Creates new user if doesn't exist
            user.setEmail(email); // Sets user email
            user.setFullname(name); // Sets user full name
            user.setGoogleProfileImage(googleProfileImage); // Saves Google profile image URL
            userRepository.save(user); // Persists new user to database
        } else {
            // Retrieves existing user from database
            user = userRepository.findByEmail(email).orElseThrow(() -> 
                new IllegalStateException("User not found despite existence check"));
        }

        // Constructs redirect URL with user details as query parameters
        String redirectUrl = String.format(
            "http://localhost:3000/oauth2/success?userID=%s&name=%s&googleProfileImage=%s",
            user.getId().toString(), // Adds user ID to URL
            user.getFullname(), // Adds user name to URL
            encodedGoogleProfileImage // Adds encoded profile image URL
        );

        return new RedirectView(redirectUrl); // Redirects to frontend with user data
    }
}
