package pro.gowize.backend.web.dto;

import java.util.Map;

/**
 * Best-effort fields extracted from a scanned photo. Mirrors the shape the
 * frontend's Confirm screen expects (it lets the user correct everything).
 */
public record ScanResponse(
        String name,
        String brand,
        String category,
        String dateType,
        String expiryDate,
        String packageSize,
        String photoUrl,
        Map<String, String> sources,
        java.util.List<String> rawLines
) {}
