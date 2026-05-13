package sv.edu.udb.dwf.menuservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.menuservice.dto.ProductoRequest;
import sv.edu.udb.dwf.menuservice.dto.ProductoResponse;
import sv.edu.udb.dwf.menuservice.model.Categoria;
import sv.edu.udb.dwf.menuservice.service.ProductoService;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService service;

    @GetMapping
    public List<ProductoResponse> listar(@RequestParam(required = false) Boolean soloDisponibles,
                                          @RequestParam(required = false) Categoria categoria) {
        if (categoria != null && soloDisponibles != null && soloDisponibles) {
            return service.listarDisponiblesPorCategoria(categoria);
        }
        if (categoria != null) {
            return service.listarPorCategoria(categoria);
        }
        if (soloDisponibles != null && soloDisponibles) {
            return service.listarDisponibles();
        }
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(service.crear(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> editar(@PathVariable Long id,
                                                    @Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(service.editar(id, req));
    }

    @PutMapping("/{id}/disponibilidad")
    public ResponseEntity<ProductoResponse> toggleDisponibilidad(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleDisponibilidad(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
