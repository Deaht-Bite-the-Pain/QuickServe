package sv.edu.udb.dwf.reportservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sv.edu.udb.dwf.reportservice.model.Reporte;
import sv.edu.udb.dwf.reportservice.model.TipoReporte;

import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    List<Reporte> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    List<Reporte> findByTipo(TipoReporte tipo);
}
