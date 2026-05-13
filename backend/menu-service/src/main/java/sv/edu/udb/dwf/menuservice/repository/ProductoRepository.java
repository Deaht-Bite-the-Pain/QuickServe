package sv.edu.udb.dwf.menuservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sv.edu.udb.dwf.menuservice.model.Categoria;
import sv.edu.udb.dwf.menuservice.model.Producto;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoria(Categoria categoria);
    List<Producto> findByDisponible(boolean disponible);
    List<Producto> findByCategoriaAndDisponible(Categoria categoria, boolean disponible);
}
