package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

// Main Spring Boot application class with exclusions for auto-configurations
@SpringBootApplication(
        exclude = {
                DataSourceAutoConfiguration.class,          // Excludes datasource auto-configuration
                DataSourceTransactionManagerAutoConfiguration.class,  // Excludes transaction manager
                HibernateJpaAutoConfiguration.class          // Excludes Hibernate JPA configuration
        }
)
public class BackendApplication {
    // Main method to start the Spring Boot application
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);  // Runs the Spring Boot application
    }

    // Bean definition for JavaMailSender to send emails
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();  // Creates new mail sender instance
        mailSender.setHost("smtp.gmail.com");                     // Sets SMTP host
        mailSender.setPort(587);                                   // Sets SMTP port
        mailSender.setUsername("arshathofficial31@gmail.com");    // Sets email username
        mailSender.setPassword("Arshath31@#");                     // Sets email password

        // Configures additional mail properties
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");      // Sets protocol to SMTP
        props.put("mail.smtp.auth", "true");               // Enables SMTP authentication
        props.put("mail.smtp.starttls.enable", "true");    // Enables STARTTLS
        props.put("mail.debug", "true");                   // Enables debug mode

        return mailSender;  // Returns configured mail sender
    }
}
