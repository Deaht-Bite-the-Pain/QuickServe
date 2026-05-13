package sv.edu.udb.dwf.reportservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sv.edu.udb.dwf.reportservice.model.TipoReporte;
import java.time.LocalDate;

@Data
public class GenerarReporteRequest {
    @NotNull(message = "El tipo de reporte es obligatorio")
    private TipoReporte tipo;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
