package backend.advisor;

// Import necessary classes and packages
import backend.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

// Global exception handling class annotated with @ControllerAdvice
@ControllerAdvice
public class CustomExceptionHandler {

    // Exception handler method for ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public Map<String,String> handleResourceNotFoundException(ResourceNotFoundException exception){
        // Create a map to store error details
        Map<String, String> errorMap = new HashMap<>();
        // Put the error message in the map
        errorMap.put("errorMesssage",exception.getMessage());
        // Return the error map as response
        return errorMap;
    }

}
