package pro.gowize.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

/**
 * A tracked product. Mirrors the frontend `Item` type. Free-form string fields
 * (category, dateType, status) intentionally match the frontend's union values
 * (e.g. "best-before", "grocery", "active") rather than enums.
 */
@Entity
@Table(name = "items")
public class Item {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    private String photoUrl;

    @Column(nullable = false)
    private String name;

    private String brand;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String dateType;

    private LocalDate expiryDate;
    private LocalDate openedOn;
    private Integer paoMonths;
    private String packageSize;

    @Column(nullable = false)
    private int countOwned = 1;

    @Column(nullable = false)
    private int reminderLeadDays;

    @Column(nullable = false)
    private String status = "active";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    /** Per-field provenance (barcode/ocr/auto/manual), stored as JSON text. */
    @Convert(converter = StringMapConverter.class)
    @Column(columnDefinition = "text")
    private Map<String, String> sources;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDateType() { return dateType; }
    public void setDateType(String dateType) { this.dateType = dateType; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public LocalDate getOpenedOn() { return openedOn; }
    public void setOpenedOn(LocalDate openedOn) { this.openedOn = openedOn; }

    public Integer getPaoMonths() { return paoMonths; }
    public void setPaoMonths(Integer paoMonths) { this.paoMonths = paoMonths; }

    public String getPackageSize() { return packageSize; }
    public void setPackageSize(String packageSize) { this.packageSize = packageSize; }

    public int getCountOwned() { return countOwned; }
    public void setCountOwned(int countOwned) { this.countOwned = countOwned; }

    public int getReminderLeadDays() { return reminderLeadDays; }
    public void setReminderLeadDays(int reminderLeadDays) { this.reminderLeadDays = reminderLeadDays; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Map<String, String> getSources() { return sources; }
    public void setSources(Map<String, String> sources) { this.sources = sources; }
}
