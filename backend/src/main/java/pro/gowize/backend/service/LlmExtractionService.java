package pro.gowize.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

/**
 * Extracts product fields directly from a photo using a vision-capable LLM
 * (via OpenRouter's OpenAI-compatible chat completions API), replacing the
 * previous Textract-OCR + regex pipeline. Deliberately conservative on
 * failure — the user confirms/edits everything on the Confirm screen, so any
 * problem here degrades to an empty (not broken) form.
 */
@Component
public class LlmExtractionService {

    private static final Logger log = LoggerFactory.getLogger(LlmExtractionService.class);

    public record Parsed(
            String name,
            String brand,
            String category,
            String dateType,
            String expiryDate,
            String packageSize,
            String rawResponse) {

        static Parsed empty() {
            return new Parsed(null, null, null, null, null, null, "");
        }
    }

    private static final Set<String> CATEGORIES = Set.of("grocery", "medicine", "cosmetic");

    private static final Set<String> DATE_TYPES =
            Set.of("best-before", "use-by", "expiry", "manufacture", "pao");

    private static final String SYSTEM_PROMPT = """
            You are a product-label reader. Look at the photo(s) of a packaged product and \
            extract its details. You may receive more than one photo of the same product \
            (e.g. front label, back label, barcode side) — cross-reference all of them and \
            merge what you find into a single answer; do not report conflicting values per \
            photo. Respond with ONLY a single JSON object — no prose, no \
            markdown code fences — matching exactly this shape:
            {
              "name": string or null,
              "brand": string or null,
              "category": one of [grocery, medicine, cosmetic] or null,
              "dateType": one of [best-before, use-by, expiry, manufacture, pao] or null \
            (pao = "period after opening", e.g. a small open-jar icon with "12M"),
              "expiryDate": string in YYYY-MM-DD format or null,
              "packageSize": string such as "500ml" or "200g" or null
            }
            Use null for any field you cannot read confidently from the image. Do not guess.""";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public LlmExtractionService(
            @Value("${openrouter.api-key:}") String apiKey,
            @Value("${openrouter.model:anthropic/claude-sonnet-4}") String model,
            @Value("${openrouter.base-url:https://openrouter.ai/api/v1/chat/completions}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
    }

    public Parsed extract(List<MultipartFile> files) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("openrouter.api-key is not configured; skipping LLM extraction");
            return Parsed.empty();
        }
        try {
            List<String> dataUris = new java.util.ArrayList<>();
            for (MultipartFile file : files) {
                dataUris.add(toDataUri(file));
            }
            String content = callOpenRouter(dataUris);
            return parseModelOutput(content);
        } catch (Exception e) {
            log.warn("LLM extraction failed; returning empty result", e);
            return Parsed.empty();
        }
    }

    private String toDataUri(MultipartFile file) throws Exception {
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/jpeg";
        }
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + contentType + ";base64," + base64;
    }

    private String callOpenRouter(List<String> imageDataUris) {
        String prompt = imageDataUris.size() > 1
                ? "Extract the product details from these photos of the same product."
                : "Extract the product details from this photo.";

        List<Object> userContent = new java.util.ArrayList<>();
        userContent.add(java.util.Map.of("type", "text", "text", prompt));
        for (String dataUri : imageDataUris) {
            userContent.add(java.util.Map.of("type", "image_url", "image_url", java.util.Map.of("url", dataUri)));
        }

        var requestBody = new java.util.LinkedHashMap<String, Object>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
                java.util.Map.of("role", "system", "content", SYSTEM_PROMPT),
                java.util.Map.of("role", "user", "content", userContent)
        ));

        String raw = restClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "https://gowize.pro")
                .header("X-Title", "GoWize")
                .body(requestBody)
                .retrieve()
                .body(String.class);

        if (raw == null || raw.isBlank()) {
            throw new IllegalStateException("OpenRouter returned an empty response");
        }
        JsonNode response;
        try {
            response = objectMapper.readTree(raw);
        } catch (Exception e) {
            throw new IllegalStateException("OpenRouter returned non-JSON response: " + raw, e);
        }
        JsonNode choices = response.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new IllegalStateException("OpenRouter response had no choices: " + response);
        }
        return choices.get(0).path("message").path("content").asText("");
    }

    private Parsed parseModelOutput(String content) {
        String json = stripCodeFences(content).trim();
        JsonNode node;
        try {
            node = objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("Could not parse LLM output as JSON: {}", content);
            return new Parsed(null, null, null, null, null, null, content);
        }

        String name = textOrNull(node, "name");
        String brand = textOrNull(node, "brand");
        String category = normalize(textOrNull(node, "category"), CATEGORIES);
        String dateType = normalize(textOrNull(node, "dateType"), DATE_TYPES);
        String expiryDate = validIsoDate(textOrNull(node, "expiryDate"));
        String packageSize = textOrNull(node, "packageSize");

        return new Parsed(name, brand, category, dateType, expiryDate, packageSize, content);
    }

    private static String stripCodeFences(String s) {
        String trimmed = s.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            int lastFence = trimmed.lastIndexOf("```");
            if (lastFence != -1) {
                trimmed = trimmed.substring(0, lastFence);
            }
        }
        return trimmed;
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || !value.isTextual()) {
            return null;
        }
        String text = value.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private static String normalize(String value, Set<String> allowed) {
        if (value == null) return null;
        String lower = value.toLowerCase(java.util.Locale.ROOT).trim();
        return allowed.contains(lower) ? lower : null;
    }

    private static String validIsoDate(String value) {
        if (value == null) return null;
        try {
            return LocalDate.parse(value).toString();
        } catch (Exception e) {
            return null;
        }
    }
}
