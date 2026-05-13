package sv.edu.udb.dwf.paymentservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.paymentservice.dto.PagoRequest;
import sv.edu.udb.dwf.paymentservice.dto.PagoResponse;
import sv.edu.udb.dwf.paymentservice.service.PagoService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PagoController {
    private final PagoService service;

    @GetMapping("/pendientes")
    public List<PagoResponse> listarPendientes() {
        return service.listarPendientes();
    }

    @GetMapping
    public List<PagoResponse> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public ResponseEntity<PagoResponse> crear(@Valid @RequestBody PagoRequest req) {
        return ResponseEntity.ok(service.crear(req));
    }

    @PutMapping("/{id}/procesar")
    public ResponseEntity<PagoResponse> procesar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String metodoPago = body.getOrDefault("metodoPago", "EFECTIVO");
        return ResponseEntity.ok(service.procesar(id, metodoPago));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<PagoResponse> rechazar(@PathVariable Long id) {
        return ResponseEntity.ok(service.rechazar(id));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<PagoResponse> obtenerPorPedido(@PathVariable Long pedidoId) {
        PagoResponse pago = service.obtenerPorPedido(pedidoId);
        return pago != null ? ResponseEntity.ok(pago) : ResponseEntity.notFound().build();
    }
}
