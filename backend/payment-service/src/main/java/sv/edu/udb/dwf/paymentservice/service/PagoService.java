package sv.edu.udb.dwf.paymentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sv.edu.udb.dwf.paymentservice.dto.PagoRequest;
import sv.edu.udb.dwf.paymentservice.dto.PagoResponse;
import sv.edu.udb.dwf.paymentservice.model.EstadoPago;
import sv.edu.udb.dwf.paymentservice.model.Pago;
import sv.edu.udb.dwf.paymentservice.repository.PagoRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository repo;
    private final RestTemplate restTemplate;

    @Value("${order.service.url:http://localhost:8082}")
    private String orderServiceUrl;

    public PagoResponse crear(PagoRequest req) {
        Pago pago = Pago.builder()
                .pedidoId(req.getPedidoId())
                .numeroMesa(req.getNumeroMesa() != null ? req.getNumeroMesa() : "N/A")
                .monto(req.getMonto())
                .metodoPago(req.getMetodoPago())
                .notas(req.getNotas())
                .estado(EstadoPago.PENDIENTE)
                .build();
        return toResponse(repo.save(pago));
    }

    public List<PagoResponse> listarPendientes() {
        return repo.findByEstado(EstadoPago.PENDIENTE).stream()
                .map(this::toResponse).toList();
    }

    public List<PagoResponse> listarTodos() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public PagoResponse procesar(Long id, String metodoPago) {
        Pago pago = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        if (pago.getEstado() != EstadoPago.PENDIENTE) {
            throw new RuntimeException("Este pago ya fue procesado");
        }
        pago.setEstado(EstadoPago.PAGADO);
        pago.setFechaPago(LocalDateTime.now());
        pago.setMetodoPago(metodoPago);
        PagoResponse response = toResponse(repo.save(pago));

        // Liberar la mesa en order-service (inter-service call)
        liberarMesaEnOrderService(pago.getNumeroMesa(), pago.getPedidoId());

        return response;
    }

    public PagoResponse rechazar(Long id) {
        Pago pago = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        pago.setEstado(EstadoPago.RECHAZADO);
        return toResponse(repo.save(pago));
    }

    public PagoResponse obtenerPorPedido(Long pedidoId) {
        return repo.findByPedidoId(pedidoId)
                .map(this::toResponse)
                .orElse(null);
    }

    /**
     * Llama al order-service para liberar la mesa asociada al pedido pagado.
     * Se hace en un try/catch para que un fallo de red no cancele el pago.
     */
    private void liberarMesaEnOrderService(String numeroMesa, Long pedidoId) {
        try {
            String url = orderServiceUrl + "/api/orders/public/pedidos/" + pedidoId + "/liberar-mesa";
            restTemplate.put(url, null);
            System.out.println("✓ Mesa del pedido " + pedidoId + " liberada tras pago.");
        } catch (Exception e) {
            System.err.println("⚠ No se pudo liberar la mesa automáticamente (pedido " + pedidoId + "): " + e.getMessage());
        }
    }

    private PagoResponse toResponse(Pago p) {
        return PagoResponse.builder()
                .id(p.getId())
                .pedidoId(p.getPedidoId())
                .numeroMesa(p.getNumeroMesa())
                .monto(p.getMonto())
                .estado(p.getEstado())
                .fechaCreacion(p.getFechaCreacion())
                .fechaPago(p.getFechaPago())
                .metodoPago(p.getMetodoPago())
                .notas(p.getNotas())
                .build();
    }
}
