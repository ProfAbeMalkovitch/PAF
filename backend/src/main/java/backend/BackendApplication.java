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

@SpringBootApplication( // Main Spring Boot application annotation
		exclude = { // Excluding auto-configuration classes for databases
				DataSourceAutoConfiguration.class,
				DataSourceTransactionManagerAutoConfiguration.class,
				HibernateJpaAutoConfiguration.class
		}
)
public class BackendApplication {
	public static void main(String[] args) { // Main method to start the application
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean // Defines a Spring bean for JavaMailSender
	public JavaMailSender javaMailSender() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl(); // Create mail sender instance
		mailSender.setHost("smtp.gmail.com"); // Set SMTP host
		mailSender.setPort(587); // Set SMTP port
		mailSender.setUsername("arshathofficial31@gmail.com"); // Set email username
		mailSender.setPassword("Arshath31@#"); // Set email password

		Properties props = mailSender.getJavaMailProperties(); // Get mail properties
		props.put("mail.transport.protocol", "smtp"); // Set protocol
		props.put("mail.smtp.auth", "true"); // Enable authentication
		props.put("mail.smtp.starttls.enable", "true"); // Enable STARTTLS
		props.put("mail.debug", "true"); // Enable debug mode

		return mailSender; // Return configured mail sender
	}
}
