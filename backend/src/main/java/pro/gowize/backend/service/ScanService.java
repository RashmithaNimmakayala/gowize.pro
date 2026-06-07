package pro.gowize.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pro.gowize.backend.web.dto.ScanResponse;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.textract.TextractClient;
import software.amazon.awssdk.services.textract.model.Block;
import software.amazon.awssdk.services.textract.model.BlockType;
import software.amazon.awssdk.services.textract.model.DetectDocumentTextRequest;
import software.amazon.awssdk.services.textract.model.DetectDocumentTextResponse;
import software.amazon.awssdk.services.textract.model.Document;

@Service
public class ScanService {

    private final S3Service s3Service;
    private final TextractClient textract;
    private final ExtractionParser parser;

    public ScanService(S3Service s3Service, TextractClient textract, ExtractionParser parser) {
        this.s3Service = s3Service;
        this.textract = textract;
        this.parser = parser;
    }

    public ScanResponse scan(MultipartFile file) {
        // 1. Store the original photo in S3.
        String key = s3Service.upload(file);

        // 2. OCR the image bytes with Textract.
        List<String> lines = detectLines(file);

        // 3. Heuristically pull out fields.
        ExtractionParser.Parsed p = parser.parse(lines);

        // 4. Provenance: anything we filled came from OCR.
        Map<String, String> sources = new LinkedHashMap<>();
        if (p.name() != null) sources.put("name", "ocr");
        if (p.expiryDate() != null) {
            sources.put("expiryDate", "ocr");
            sources.put("dateType", "ocr");
        }
        if (p.packageSize() != null) sources.put("packageSize", "ocr");

        return new ScanResponse(
                p.name(),
                null,
                "grocery",
                p.dateType(),
                ExtractionParser.iso(p.expiryDate()),
                p.packageSize(),
                s3Service.presignedGetUrl(key),
                sources,
                lines);
    }

    private List<String> detectLines(MultipartFile file) {
        try {
            Document document = Document.builder()
                    .bytes(SdkBytes.fromByteArray(file.getBytes()))
                    .build();
            DetectDocumentTextResponse resp = textract.detectDocumentText(
                    DetectDocumentTextRequest.builder().document(document).build());
            return resp.blocks().stream()
                    .filter(b -> b.blockType() == BlockType.LINE)
                    .map(Block::text)
                    .toList();
        } catch (Exception e) {
            throw new IllegalStateException("Textract failed to read the image", e);
        }
    }
}
