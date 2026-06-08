package pro.gowize.backend.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pro.gowize.backend.domain.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
