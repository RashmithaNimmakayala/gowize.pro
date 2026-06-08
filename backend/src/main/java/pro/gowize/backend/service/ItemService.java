package pro.gowize.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import pro.gowize.backend.domain.Item;
import pro.gowize.backend.repo.ItemRepository;
import pro.gowize.backend.web.dto.CreateItemRequest;

@Service
public class ItemService {

    private final ItemRepository repo;

    public ItemService(ItemRepository repo) {
        this.repo = repo;
    }

    public List<Item> list(String userId, String status) {
        return status == null || status.isBlank()
                ? repo.findByUserIdOrderByCreatedAtDesc(userId)
                : repo.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    public Item get(String id, String userId) {
        return repo.findById(id)
                .filter(i -> i.getUserId().equals(userId))
                .orElse(null);
    }

    public Item create(String userId, CreateItemRequest r) {
        Item item = new Item();
        item.setId(UUID.randomUUID().toString());
        item.setCreatedAt(Instant.now());
        item.setStatus("active");
        item.setUserId(userId);
        item.setPhotoUrl(r.photoUrl());
        item.setName(r.name());
        item.setBrand(r.brand());
        item.setCategory(r.category());
        item.setDateType(r.dateType());
        item.setExpiryDate(r.expiryDate());
        item.setOpenedOn(r.openedOn());
        item.setPaoMonths(r.paoMonths());
        item.setPackageSize(r.packageSize());
        item.setCountOwned(r.countOwned() <= 0 ? 1 : r.countOwned());
        item.setReminderLeadDays(r.reminderLeadDays());
        item.setSources(r.sources());
        return repo.save(item);
    }

    public Item updateStatus(String id, String userId, String status) {
        Item item = repo.findById(id)
                .filter(i -> i.getUserId().equals(userId))
                .orElse(null);
        if (item == null) return null;
        item.setStatus(status);
        return repo.save(item);
    }

    public boolean delete(String id, String userId) {
        Item item = repo.findById(id)
                .filter(i -> i.getUserId().equals(userId))
                .orElse(null);
        if (item == null) return false;
        repo.deleteById(id);
        return true;
    }
}
