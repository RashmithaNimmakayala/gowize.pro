package pro.gowize.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import pro.gowize.backend.domain.PushSubscription;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, String> {
    List<PushSubscription> findByUserId(String userId);
    Optional<PushSubscription> findByUserIdAndEndpoint(String userId, String endpoint);
    void deleteByUserIdAndEndpoint(String userId, String endpoint);
}
