package pro.gowize.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.textract.TextractClient;

/**
 * AWS SDK v2 clients. Credentials come from the default provider chain
 * (env vars AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, or ~/.aws), so no secrets
 * live in code or config.
 */
@Configuration
public class AwsConfig {

    private final Region region;

    public AwsConfig(@Value("${aws.region}") String region) {
        this.region = Region.of(region);
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public TextractClient textractClient() {
        return TextractClient.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
