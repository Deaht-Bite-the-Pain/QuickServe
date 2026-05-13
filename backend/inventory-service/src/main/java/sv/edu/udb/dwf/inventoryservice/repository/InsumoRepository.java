package sv.edu.udb.dwf.inventoryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sv.edu.udb.dwf.inventoryservice.model.Insumo;

import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    List<Insumo> findAllByOrderByNombreAsc();
    boolean existsByNombreIgnoreCase(String nombre);
}
