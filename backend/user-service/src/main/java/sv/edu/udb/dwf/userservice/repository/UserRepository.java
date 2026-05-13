package sv.edu.udb.dwf.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sv.edu.udb.dwf.userservice.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
