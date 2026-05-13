package sv.edu.udb.dwf.orderservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DetallePedidoRequest {

    @NotNull(message = "El ID de producto es obligatorio")
    private Long productoId;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 150, message = "Nombre de producto demasiado largo")
    private String nombreProducto;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @DecimalMax(value = "9999.99", message = "Precio fuera de rango permitido")
    private BigDecimal precioUnitario;

    @Min(value = 1, message = "La cantidad mínima es 1")
    @Max(value = 50, message = "No se pueden pedir más de 50 unidades del mismo producto")
    private int cantidad;
}
