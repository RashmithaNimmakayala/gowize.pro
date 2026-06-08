package pro.gowize.backend.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pro.gowize.backend.domain.Item;

public interface ItemRepository extends JpaRepository<Item, String> {
    List<Item> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Item> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);

    boolean existsByIdAndUserId(String id, String userId);
}
