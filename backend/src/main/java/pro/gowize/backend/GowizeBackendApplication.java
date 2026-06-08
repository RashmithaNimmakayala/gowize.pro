package pro.gowize.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GowizeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GowizeBackendApplication.class, args);
	}

}
