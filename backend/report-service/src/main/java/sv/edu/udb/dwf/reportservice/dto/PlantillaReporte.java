package sv.edu.udb.dwf.reportservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlantillaReporte {
    private String tipo;
    private String nombre;
    private String descripcion;
}
