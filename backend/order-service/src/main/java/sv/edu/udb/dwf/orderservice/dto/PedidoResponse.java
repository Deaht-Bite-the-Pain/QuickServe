package sv.edu.udb.dwf.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sv.edu.udb.dwf.orderservice.model.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {
    private Long id;
    private Long meseroId;
    private String meseroNombre;
    private String clienteNombre;
    private String numeroMesa;
    private EstadoPedido estado;
    private LocalDateTime fechaCreacion;
    private BigDecimal total;
    private List<DetallePedidoResponse> detalles;
}
