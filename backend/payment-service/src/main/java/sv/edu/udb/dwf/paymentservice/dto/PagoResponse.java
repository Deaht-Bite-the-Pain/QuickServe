package sv.edu.udb.dwf.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sv.edu.udb.dwf.paymentservice.model.EstadoPago;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoResponse {
    private Long id;
    private Long pedidoId;
    private String numeroMesa;
    private BigDecimal monto;
    private EstadoPago estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPago;
    private String metodoPago;
    private String notas;
}
