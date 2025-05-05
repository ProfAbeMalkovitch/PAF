package backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // Marks this class as a Spring configuration class
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps URL pattern "/media/**" to serve files from "uploads/media/" directory
        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:uploads/media/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configures CORS for all endpoints, allowing requests from localhost:3000
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
