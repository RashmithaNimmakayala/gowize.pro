package pro.gowize.backend.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pro.gowize.backend.domain.Item;
import pro.gowize.backend.service.ItemService;
import pro.gowize.backend.web.dto.CreateItemRequest;
import pro.gowize.backend.web.dto.ItemResponse;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @GetMapping
    public List<ItemResponse> list(@AuthenticationPrincipal String userId,
                                   @RequestParam(required = false) String status) {
        return service.list(userId, status).stream().map(ItemResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> get(@AuthenticationPrincipal String userId,
                                            @PathVariable String id) {
        Item item = service.get(id, userId);
        return item == null ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(ItemResponse.from(item));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@AuthenticationPrincipal String userId,
                               @Valid @RequestBody CreateItemRequest request) {
        return ItemResponse.from(service.create(userId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ItemResponse> updateStatus(@AuthenticationPrincipal String userId,
                                                     @PathVariable String id,
                                                     @RequestParam String status) {
        Item item = service.updateStatus(id, userId, status);
        return item == null ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(ItemResponse.from(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String userId,
                                       @PathVariable String id) {
        return service.delete(id, userId) ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
