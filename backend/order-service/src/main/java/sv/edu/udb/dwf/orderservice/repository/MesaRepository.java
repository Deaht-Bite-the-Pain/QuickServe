package sv.edu.udb.dwf.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sv.edu.udb.dwf.orderservice.model.Mesa;

import java.util.List;
import java.util.Optional;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findByDisponibleTrue();
    Optional<Mesa> findByNumero(Integer numero);
}
