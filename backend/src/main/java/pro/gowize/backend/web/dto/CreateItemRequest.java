package pro.gowize.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.util.Map;

/** Payload to create an item. Server assigns id, createdAt, and status. */
public record CreateItemRequest(
        String photoUrl,
        @NotBlank String name,
        String brand,
        @NotBlank String category,
        @NotBlank String dateType,
        LocalDate expiryDate,
        LocalDate openedOn,
        Integer paoMonths,
        String packageSize,
        @Positive int countOwned,
        int reminderLeadDays,
        Map<String, String> sources
) {}
