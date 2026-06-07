package pro.gowize.backend.service;

import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class S3Service {

    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;

    public S3Service(S3Client s3, S3Presigner presigner,
                     @Value("${aws.s3.bucket}") String bucket) {
        this.s3 = s3;
        this.presigner = presigner;
        this.bucket = bucket;
    }

    /** Uploads the file under scans/ and returns the object key. */
    public String upload(MultipartFile file) {
        String ext = extensionFor(file.getContentType());
        String key = "scans/" + UUID.randomUUID() + ext;
        try {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to upload scan to S3", e);
        }
        return key;
    }

    /** Time-limited URL the browser can use to display the uploaded image. */
    public String presignedGetUrl(String key) {
        GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();
        GetObjectPresignRequest presign = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(12))
                .getObjectRequest(get)
                .build();
        return presigner.presignGetObject(presign).url().toString();
    }

    private String extensionFor(String contentType) {
        if (contentType == null) return "";
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/heic" -> ".heic";
            default -> ".jpg";
        };
    }
}
