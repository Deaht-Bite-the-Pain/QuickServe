package sv.edu.udb.dwf.inventoryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsumoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String unidad;
    private BigDecimal cantidad;
    private BigDecimal stockMinimo;
    private boolean bajoStock;
    private LocalDateTime fechaActualizacion;
}
