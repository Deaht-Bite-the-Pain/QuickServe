package sv.edu.udb.dwf.inventoryservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AjusteStockRequest {

    @NotNull
    private BigDecimal cantidad; // positivo = entrada, negativo = salida
}
