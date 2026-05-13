package sv.edu.udb.dwf.paymentservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PagoRequest {
    @NotNull(message = "El ID del pedido es obligatorio")
    private Long pedidoId;

    private String numeroMesa;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    private String metodoPago;
    private String notas;
}
