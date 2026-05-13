package sv.edu.udb.dwf.reportservice.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReporteResponse {
    private Long id;
    private String nombre;
    private String tipo;
    private String descripcion;
    private String fechaCreacion;
    private Long usuarioId;

    @JsonRawValue
    private String datosJson;
}
