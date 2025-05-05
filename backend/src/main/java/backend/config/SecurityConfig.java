package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration // Marks this class as a Spring configuration class
@EnableWebSecurity // Enables Spring Security's web security support
public class SecurityConfig {

    @Bean // Defines a bean to be managed by Spring container
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Disables CSRF protection
                .cors().and() // Enables CORS and combines with next configuration
                .authorizeHttpRequests(auth -> auth // Configures authorization for HTTP requests
                        .requestMatchers( // Specifies paths that don't need authentication
                                "/login/**",
                                "/oauth2/**",
                                "/user/**",
                                "/posts/**",
                                "/media/**",
                                "/sendVerificationCode/**",
                                "/uploads/profile/**",
                                "/learningPlan/**",
                                "/learningProgress/**",
                                "/notifications/**"
                        ).permitAll() // Allows access to above paths without authentication
                        .anyRequest().authenticated() // Requires authentication for any other request
                )
                .oauth2Login(oauth2 -> oauth2 // Configures OAuth2 login
                        .defaultSuccessUrl("/oauth2/success", true) // Sets default success URL after OAuth2 login
                );
        return http.build(); // Builds and returns the security filter chain
    }

    @Bean // Defines a bean for CORS configuration
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Creates CORS configuration source
        CorsConfiguration config = new CorsConfiguration(); // Creates CORS configuration
        config.addAllowedOrigin("http://localhost:3000"); // Allows requests from frontend origin
        config.addAllowedMethod("*"); // Allows all HTTP methods
        config.addAllowedHeader("*"); // Allows all headers
        source.registerCorsConfiguration("/**", config); // Applies CORS config to all paths
        return new CorsFilter(source); // Returns new CORS filter with configuration
    }
}
