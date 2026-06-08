package pro.gowize.backend.web;

import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pro.gowize.backend.service.ScanService;
import pro.gowize.backend.web.dto.ScanResponse;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    /**
     * Upload one or more photos of the same product (e.g. front, back, barcode
     * side); returns best-effort extracted fields merged across all of them.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ScanResponse> scan(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            return ResponseEntity.badRequest().build();
        }
        List<MultipartFile> nonEmpty = files.stream().filter(f -> !f.isEmpty()).toList();
        return ResponseEntity.ok(scanService.scan(nonEmpty));
    }
}
