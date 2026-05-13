package sv.edu.udb.dwf.reportservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoExternoDTO {
    private Long id;
    private Long pedidoId;
    private String numeroMesa;
    private BigDecimal monto;
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPago;
    private String metodoPago;
    private String notas;
}
