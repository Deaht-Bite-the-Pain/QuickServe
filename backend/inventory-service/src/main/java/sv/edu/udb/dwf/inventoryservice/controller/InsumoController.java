package sv.edu.udb.dwf.inventoryservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.inventoryservice.dto.AjusteStockRequest;
import sv.edu.udb.dwf.inventoryservice.dto.InsumoRequest;
import sv.edu.udb.dwf.inventoryservice.dto.InsumoResponse;
import sv.edu.udb.dwf.inventoryservice.service.InsumoService;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InsumoController {

    private final InsumoService service;

    @GetMapping
    public List<InsumoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public InsumoResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<InsumoResponse> crear(@Valid @RequestBody InsumoRequest req) {
        return ResponseEntity.ok(service.crear(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody InsumoRequest req) {
        return ResponseEntity.ok(service.actualizar(id, req));
    }

    @PutMapping("/{id}/ajuste")
    public ResponseEntity<InsumoResponse> ajustarStock(@PathVariable Long id, @Valid @RequestBody AjusteStockRequest req) {
        return ResponseEntity.ok(service.ajustarStock(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
