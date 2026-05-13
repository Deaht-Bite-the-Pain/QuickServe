package sv.edu.udb.dwf.orderservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sv.edu.udb.dwf.orderservice.model.EstadoPedido;

@Data
public class ActualizarEstadoRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoPedido estado;
}
