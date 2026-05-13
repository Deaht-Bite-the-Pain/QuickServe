package sv.edu.udb.dwf.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InsumoRequest {

    @NotBlank
    private String nombre;

    private String descripcion;

    @NotBlank
    private String unidad;

    @NotNull
    @PositiveOrZero
    private BigDecimal cantidad;

    @NotNull
    @PositiveOrZero
    private BigDecimal stockMinimo;
}
