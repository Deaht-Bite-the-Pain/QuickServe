package sv.edu.udb.dwf.orderservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.orderservice.dto.ActualizarEstadoRequest;
import sv.edu.udb.dwf.orderservice.dto.PedidoRequest;
import sv.edu.udb.dwf.orderservice.dto.PedidoResponse;
import sv.edu.udb.dwf.orderservice.dto.SolicitudClienteRequest;
import sv.edu.udb.dwf.orderservice.security.JwtUtil;
import sv.edu.udb.dwf.orderservice.service.MesaService;
import sv.edu.udb.dwf.orderservice.service.PedidoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService service;
    private final MesaService mesaService;
    private final JwtUtil jwtUtil;

    // ── Endpoints públicos (clientes sin login) ───────────────────────────────

    @PostMapping("/public")
    public ResponseEntity<?> crearSolicitud(@Valid @RequestBody SolicitudClienteRequest req) {
        try {
            return ResponseEntity.ok(service.crearSolicitud(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Cuántas mesas disponibles quedan (para mostrar en el frontend) */
    @GetMapping("/public/mesas/disponibles")
    public ResponseEntity<Map<String, Integer>> mesasDisponibles() {
        return ResponseEntity.ok(Map.of("cantidad", mesaService.contarDisponibles()));
    }

    /** Liberar una mesa (llamado desde payment-service al confirmar pago) */
    @PutMapping("/public/mesas/{numero}/liberar")
    public ResponseEntity<Void> liberarMesa(@PathVariable String numero) {
        mesaService.liberarMesa(numero);
        return ResponseEntity.ok().build();
    }

    /** Liberar mesa asociada a un pedido (alternativa usada por payment-service) */
    @PutMapping("/public/pedidos/{id}/liberar-mesa")
    public ResponseEntity<Void> liberarMesaPorPedido(@PathVariable Long id) {
        service.liberarMesaPorPedido(id);
        return ResponseEntity.ok().build();
    }

    // ── Endpoints autenticados ────────────────────────────────────────────────

    @PutMapping("/{id}/aceptar")
    public ResponseEntity<PedidoResponse> aceptarSolicitud(@PathVariable Long id,
                                                            HttpServletRequest request) {
        Long meseroId = extractId(request);
        String meseroNombre = extractNombre(request);
        return ResponseEntity.ok(service.aceptarSolicitud(id, meseroId, meseroNombre));
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody PedidoRequest req,
                                                 HttpServletRequest request) {
        Long meseroId = extractId(request);
        String meseroNombre = extractNombre(request);
        return ResponseEntity.ok(service.crear(req, meseroId, meseroNombre));
    }

    @GetMapping
    public List<PedidoResponse> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/todos")
    public List<PedidoResponse> listarTodos() {
        return service.listar();
    }

    @GetMapping("/mis-pedidos")
    public List<PedidoResponse> misPedidos(HttpServletRequest request) {
        return service.listarPorMesero(extractId(request));
    }

    @GetMapping("/estado/{estado}")
    public List<PedidoResponse> porEstado(@PathVariable String estado) {
        return service.listarPorEstado(
                sv.edu.udb.dwf.orderservice.model.EstadoPedido.valueOf(estado.toUpperCase()));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstado(@PathVariable Long id,
                                                             @Valid @RequestBody ActualizarEstadoRequest req) {
        return ResponseEntity.ok(service.actualizarEstado(id, req.getEstado()));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelar(id));
    }

    // ── Helpers JWT ───────────────────────────────────────────────────────────

    private Long extractId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractClaims(token).get("id", Long.class);
    }

    private String extractNombre(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractClaims(token).get("nombre", String.class);
    }
}
