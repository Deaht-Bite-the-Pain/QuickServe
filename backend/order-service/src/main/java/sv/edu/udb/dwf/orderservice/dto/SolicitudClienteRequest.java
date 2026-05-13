package sv.edu.udb.dwf.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class SolicitudClienteRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 80, message = "El nombre debe tener entre 2 y 80 caracteres")
    @Pattern(
        regexp = "^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$",
        message = "El nombre solo puede contener letras y espacios"
    )
    private String clienteNombre;

    // El servidor asigna la mesa automáticamente; el cliente no la envía.
    // Este campo se ignora si llega en el request.
    private String numeroMesa;

    @NotEmpty(message = "El pedido debe tener al menos un producto")
    @Valid
    private List<DetallePedidoRequest> detalles;
}
