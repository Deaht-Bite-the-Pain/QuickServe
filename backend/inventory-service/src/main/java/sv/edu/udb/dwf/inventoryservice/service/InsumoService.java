package sv.edu.udb.dwf.inventoryservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import sv.edu.udb.dwf.inventoryservice.dto.AjusteStockRequest;
import sv.edu.udb.dwf.inventoryservice.dto.InsumoRequest;
import sv.edu.udb.dwf.inventoryservice.dto.InsumoResponse;
import sv.edu.udb.dwf.inventoryservice.model.Insumo;
import sv.edu.udb.dwf.inventoryservice.repository.InsumoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository repo;

    public List<InsumoResponse> listar() {
        return repo.findAllByOrderByNombreAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    public InsumoResponse obtener(Long id) {
        return repo.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
    }

    public InsumoResponse crear(InsumoRequest req) {
        if (repo.existsByNombreIgnoreCase(req.getNombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un insumo con ese nombre");
        }
        Insumo insumo = Insumo.builder()
            .nombre(req.getNombre())
            .descripcion(req.getDescripcion())
            .unidad(req.getUnidad())
            .cantidad(req.getCantidad())
            .stockMinimo(req.getStockMinimo())
            .fechaActualizacion(LocalDateTime.now())
            .build();
        return toResponse(repo.save(insumo));
    }

    public InsumoResponse actualizar(Long id, InsumoRequest req) {
        Insumo insumo = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
        insumo.setNombre(req.getNombre());
        insumo.setDescripcion(req.getDescripcion());
        insumo.setUnidad(req.getUnidad());
        insumo.setCantidad(req.getCantidad());
        insumo.setStockMinimo(req.getStockMinimo());
        insumo.setFechaActualizacion(LocalDateTime.now());
        return toResponse(repo.save(insumo));
    }

    public InsumoResponse ajustarStock(Long id, AjusteStockRequest req) {
        Insumo insumo = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado"));
        BigDecimal nueva = insumo.getCantidad().add(req.getCantidad());
        if (nueva.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El stock no puede quedar negativo");
        }
        insumo.setCantidad(nueva);
        insumo.setFechaActualizacion(LocalDateTime.now());
        return toResponse(repo.save(insumo));
    }

    public void eliminar(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo no encontrado");
        }
        repo.deleteById(id);
    }

    private InsumoResponse toResponse(Insumo i) {
        return InsumoResponse.builder()
            .id(i.getId())
            .nombre(i.getNombre())
            .descripcion(i.getDescripcion())
            .unidad(i.getUnidad())
            .cantidad(i.getCantidad())
            .stockMinimo(i.getStockMinimo())
            .bajoStock(i.getCantidad().compareTo(i.getStockMinimo()) <= 0)
            .fechaActualizacion(i.getFechaActualizacion())
            .build();
    }
}
