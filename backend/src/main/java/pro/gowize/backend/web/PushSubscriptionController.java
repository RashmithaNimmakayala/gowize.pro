package pro.gowize.backend.web;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import pro.gowize.backend.domain.PushSubscription;
import pro.gowize.backend.repo.PushSubscriptionRepository;
import pro.gowize.backend.web.dto.PushSubscribeRequest;

import java.util.UUID;

@RestController
@RequestMapping("/api/push")
public class PushSubscriptionController {

    private final PushSubscriptionRepository repo;

    public PushSubscriptionController(PushSubscriptionRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@AuthenticationPrincipal String userId,
                                       @Valid @RequestBody PushSubscribeRequest req) {
        repo.findByUserIdAndEndpoint(userId, req.endpoint()).ifPresentOrElse(
                existing -> {
                    existing.setP256dh(req.p256dh());
                    existing.setAuth(req.auth());
                    repo.save(existing);
                },
                () -> {
                    PushSubscription sub = new PushSubscription();
                    sub.setId(UUID.randomUUID().toString());
                    sub.setUserId(userId);
                    sub.setEndpoint(req.endpoint());
                    sub.setP256dh(req.p256dh());
                    sub.setAuth(req.auth());
                    repo.save(sub);
                }
        );
        return ResponseEntity.ok().build();
    }

    @Transactional
    @DeleteMapping("/subscribe")
    public ResponseEntity<?> unsubscribe(@AuthenticationPrincipal String userId,
                                         @RequestParam String endpoint) {
        repo.deleteByUserIdAndEndpoint(userId, endpoint);
        return ResponseEntity.noContent().build();
    }
}
