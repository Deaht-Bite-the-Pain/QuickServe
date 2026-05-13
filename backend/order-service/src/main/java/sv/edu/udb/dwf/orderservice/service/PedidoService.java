package sv.edu.udb.dwf.orderservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sv.edu.udb.dwf.orderservice.dto.*;
import sv.edu.udb.dwf.orderservice.model.DetallePedido;
import sv.edu.udb.dwf.orderservice.model.EstadoPedido;
import sv.edu.udb.dwf.orderservice.model.Pedido;
import sv.edu.udb.dwf.orderservice.repository.PedidoRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository repo;
    private final SimpMessagingTemplate messenger;
    private final MesaService mesaService;

    public PedidoResponse crearSolicitud(SolicitudClienteRequest req) {
        // Asignar mesa automáticamente (ignora lo que el cliente envíe)
        String mesaAsignada = mesaService.asignarMesa();

        Pedido pedido = Pedido.builder()
                .clienteNombre(req.getClienteNombre().trim())
                .numeroMesa(mesaAsignada)
                .estado(EstadoPedido.SOLICITUD_CLIENTE)
                .total(BigDecimal.ZERO)
                .build();

        List<DetallePedido> detalles = req.getDetalles().stream().map(d -> {
            BigDecimal subtotal = d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()));
            return DetallePedido.builder()
                    .pedido(pedido)
                    .productoId(d.getProductoId())
                    .nombreProducto(d.getNombreProducto())
                    .precioUnitario(d.getPrecioUnitario())
                    .cantidad(d.getCantidad())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        BigDecimal total = detalles.stream()
                .map(DetallePedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setTotal(total);
        pedido.setDetalles(detalles);

        PedidoResponse response = toResponse(repo.save(pedido));
        messenger.convertAndSend("/topic/solicitudes", response);
        return response;
    }

    public PedidoResponse aceptarSolicitud(Long id, Long meseroId, String meseroNombre) {
        Pedido pedido = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (pedido.getEstado() != EstadoPedido.SOLICITUD_CLIENTE) {
            throw new RuntimeException("Solo se pueden aceptar solicitudes de clientes");
        }
        pedido.setMeseroId(meseroId);
        pedido.setMeseroNombre(meseroNombre);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        PedidoResponse response = toResponse(repo.save(pedido));
        messenger.convertAndSend("/topic/cocina", response);
        messenger.convertAndSend("/topic/pedidos", response);
        return response;
    }

    public PedidoResponse crear(PedidoRequest req, Long meseroId, String meseroNombre) {
        // Pedidos creados directamente por el mesero también auto-asignan mesa
        String mesaAsignada = req.getNumeroMesa() != null && !req.getNumeroMesa().isBlank()
                ? req.getNumeroMesa()
                : mesaService.asignarMesa();

        Pedido pedido = Pedido.builder()
                .meseroId(meseroId)
                .meseroNombre(meseroNombre)
                .numeroMesa(mesaAsignada)
                .estado(EstadoPedido.PENDIENTE)
                .total(BigDecimal.ZERO)
                .build();

        List<DetallePedido> detalles = req.getDetalles().stream().map(d -> {
            BigDecimal subtotal = d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()));
            return DetallePedido.builder()
                    .pedido(pedido)
                    .productoId(d.getProductoId())
                    .nombreProducto(d.getNombreProducto())
                    .precioUnitario(d.getPrecioUnitario())
                    .cantidad(d.getCantidad())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        BigDecimal total = detalles.stream()
                .map(DetallePedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setTotal(total);
        pedido.setDetalles(detalles);

        PedidoResponse response = toResponse(repo.save(pedido));
        messenger.convertAndSend("/topic/cocina", response);
        return response;
    }

    public List<PedidoResponse> listar() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public List<PedidoResponse> listarActivos() {
        return repo.findByEstadoIn(List.of(
                EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO
        )).stream().map(this::toResponse).toList();
    }

    public List<PedidoResponse> listarPorEstado(EstadoPedido estado) {
        return repo.findByEstado(estado).stream().map(this::toResponse).toList();
    }

    public List<PedidoResponse> listarPorMesero(Long meseroId) {
        return repo.findByMeseroIdAndEstadoIn(meseroId,
                List.of(EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION,
                        EstadoPedido.LISTO, EstadoPedido.ENTREGADO))
                .stream().map(this::toResponse).toList();
    }

    public PedidoResponse actualizarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEstado(nuevoEstado);

        // Liberar mesa cuando el pedido se cancela
        if (nuevoEstado == EstadoPedido.CANCELADO) {
            mesaService.liberarMesa(pedido.getNumeroMesa());
        }

        PedidoResponse response = toResponse(repo.save(pedido));
        messenger.convertAndSend("/topic/pedidos", response);
        return response;
    }

    public PedidoResponse cancelar(Long id) {
        Pedido pedido = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar pedidos en estado PENDIENTE");
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        // Liberar la mesa al cancelar
        mesaService.liberarMesa(pedido.getNumeroMesa());

        PedidoResponse response = toResponse(repo.save(pedido));
        messenger.convertAndSend("/topic/pedidos", response);
        return response;
    }

    /** Llamado desde payment-service cuando el pago es PAGADO */
    public void liberarMesaPorPedido(Long pedidoId) {
        repo.findById(pedidoId).ifPresent(pedido -> {
            mesaService.liberarMesa(pedido.getNumeroMesa());
        });
    }

    private PedidoResponse toResponse(Pedido p) {
        return PedidoResponse.builder()
                .id(p.getId())
                .meseroId(p.getMeseroId())
                .meseroNombre(p.getMeseroNombre())
                .clienteNombre(p.getClienteNombre())
                .numeroMesa(p.getNumeroMesa())
                .estado(p.getEstado())
                .fechaCreacion(p.getFechaCreacion())
                .total(p.getTotal())
                .detalles(p.getDetalles().stream().map(d -> DetallePedidoResponse.builder()
                        .id(d.getId())
                        .productoId(d.getProductoId())
                        .nombreProducto(d.getNombreProducto())
                        .precioUnitario(d.getPrecioUnitario())
                        .cantidad(d.getCantidad())
                        .subtotal(d.getSubtotal())
                        .build()).toList())
                .build();
    }
}
