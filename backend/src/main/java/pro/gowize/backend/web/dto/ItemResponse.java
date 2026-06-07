package pro.gowize.backend.web.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import pro.gowize.backend.domain.Item;

public record ItemResponse(
        String id,
        String photoUrl,
        String name,
        String brand,
        String category,
        String dateType,
        LocalDate expiryDate,
        LocalDate openedOn,
        Integer paoMonths,
        String packageSize,
        int countOwned,
        int reminderLeadDays,
        String status,
        Instant createdAt,
        Map<String, String> sources
) {
    public static ItemResponse from(Item i) {
        return new ItemResponse(
                i.getId(), i.getPhotoUrl(), i.getName(), i.getBrand(), i.getCategory(),
                i.getDateType(), i.getExpiryDate(), i.getOpenedOn(), i.getPaoMonths(),
                i.getPackageSize(), i.getCountOwned(), i.getReminderLeadDays(),
                i.getStatus(), i.getCreatedAt(),
                i.getSources() == null ? Map.of() : i.getSources());
    }
}
