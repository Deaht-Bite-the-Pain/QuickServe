package sv.edu.udb.dwf.reportservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoExternoDTO {
    private Long id;
    private Long meseroId;
    private String meseroNombre;
    private String clienteNombre;
    private String numeroMesa;
    private String estado;
    private LocalDateTime fechaCreacion;
    private BigDecimal total;
    private List<DetalleExternoDTO> detalles;

    @Data
    public static class DetalleExternoDTO {
        private Long id;
        private Long productoId;
        private String nombreProducto;
        private BigDecimal precioUnitario;
        private int cantidad;
        private BigDecimal subtotal;
    }
}
