package pro.gowize.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pro.gowize.backend.web.dto.ScanResponse;

@Service
public class ScanService {

    private final S3Service s3Service;
    private final LlmExtractionService llmExtractionService;

    public ScanService(S3Service s3Service, LlmExtractionService llmExtractionService) {
        this.s3Service = s3Service;
        this.llmExtractionService = llmExtractionService;
    }

    public ScanResponse scan(MultipartFile file) {
        // 1. Store the original photo in S3.
        String key = s3Service.upload(file);

        // 2. Ask the vision LLM to read the label directly from the photo.
        LlmExtractionService.Parsed p = llmExtractionService.extract(file);

        // 3. Provenance: anything we filled came from the LLM.
        Map<String, String> sources = new LinkedHashMap<>();
        if (p.name() != null) sources.put("name", "llm");
        if (p.brand() != null) sources.put("brand", "llm");
        if (p.category() != null) sources.put("category", "llm");
        if (p.dateType() != null) sources.put("dateType", "llm");
        if (p.expiryDate() != null) sources.put("expiryDate", "llm");
        if (p.packageSize() != null) sources.put("packageSize", "llm");

        return new ScanResponse(
                p.name(),
                p.brand(),
                p.category(),
                p.dateType(),
                p.expiryDate(),
                p.packageSize(),
                s3Service.presignedGetUrl(key),
                sources,
                List.of());
    }
}
