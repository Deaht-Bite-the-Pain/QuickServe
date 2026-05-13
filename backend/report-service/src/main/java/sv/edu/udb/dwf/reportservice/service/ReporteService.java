package sv.edu.udb.dwf.reportservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sv.edu.udb.dwf.reportservice.dto.*;
import sv.edu.udb.dwf.reportservice.model.Reporte;
import sv.edu.udb.dwf.reportservice.model.TipoReporte;
import sv.edu.udb.dwf.reportservice.repository.ReporteRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final ReporteRepository repo;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    private static final String ORDER_SERVICE_URL = "http://localhost:8082";
    private static final String PAYMENT_SERVICE_URL = "http://localhost:8084";

    public List<PlantillaReporte> obtenerPlantillas() {
        return List.of(
            PlantillaReporte.builder()
                .tipo("VENTA_DIARIA")
                .nombre("Reporte de Venta Diaria")
                .descripcion("Muestra el total de ventas, métodos de pago y cantidad de transacciones del día")
                .build(),
            PlantillaReporte.builder()
                .tipo("PRODUCTOS_MAS_VENDIDOS")
                .nombre("Productos Más Vendidos")
                .descripcion("Top 10 de productos vendidos con cantidad e ingresos")
                .build(),
            PlantillaReporte.builder()
                .tipo("GANANCIAS_MENSUAL")
                .nombre("Ganancias Mensuales")
                .descripcion("Tendencia de ganancias por mes")
                .build(),
            PlantillaReporte.builder()
                .tipo("DESEMPENIO_MESEROS")
                .nombre("Desempeño de Meseros")
                .descripcion("Pedidos y ganancias generadas por cada mesero")
                .build()
        );
    }

    public ReporteResponse generarReporte(GenerarReporteRequest req, Long usuarioId, String usuarioNombre, String token) {
        Map<String, Object> datos = switch (req.getTipo()) {
            case VENTA_DIARIA -> generarVentaDiaria(token, req.getFechaInicio(), req.getFechaFin());
            case PRODUCTOS_MAS_VENDIDOS -> generarProductosMasVendidos(token);
            case GANANCIAS_MENSUAL -> generarGananciasMensual(token);
            case DESEMPENIO_MESEROS -> generarDesempenioMeseros(token);
        };

        String nombre = req.getTipo() + " - " + LocalDate.now();
        String datosJson = convertToJson(datos);

        Reporte reporte = Reporte.builder()
            .nombre(nombre)
            .tipo(req.getTipo())
            .descripcion("Generado por " + usuarioNombre)
            .fechaCreacion(LocalDateTime.now())
            .usuarioId(usuarioId)
            .datosJson(datosJson)
            .build();

        Reporte saved = repo.save(reporte);
        return toResponse(saved);
    }

    public List<ReporteResponse> listarReportesDelUsuario(Long usuarioId) {
        return repo.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public ReporteResponse obtenerReporte(Long id) {
        return repo.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
    }

    public void eliminarReporte(Long id) {
        repo.deleteById(id);
    }

    // ===== Llamadas HTTP a otros microservicios con JWT =====

    private HttpEntity<Void> authEntity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        return new HttpEntity<>(headers);
    }

    private List<PedidoExternoDTO> obtenerTodosLosPedidos(String token) {
        try {
            System.out.println(">>> [REPORT] Consultando pedidos en " + ORDER_SERVICE_URL + "/api/orders/todos");
            ResponseEntity<List<PedidoExternoDTO>> response = restTemplate.exchange(
                ORDER_SERVICE_URL + "/api/orders/todos",
                HttpMethod.GET,
                authEntity(token),
                new ParameterizedTypeReference<List<PedidoExternoDTO>>() {}
            );
            List<PedidoExternoDTO> body = response.getBody() != null ? response.getBody() : new ArrayList<>();
            System.out.println(">>> [REPORT] Pedidos recibidos: " + body.size());
            for (PedidoExternoDTO p : body) {
                System.out.println("    - Pedido id=" + p.getId() + " estado=" + p.getEstado() + " mesero=" + p.getMeseroNombre() + " total=" + p.getTotal());
            }
            return body;
        } catch (Exception e) {
            System.err.println(">>> [REPORT] Error consultando pedidos: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private List<PagoExternoDTO> obtenerTodosLosPagos(String token) {
        try {
            System.out.println(">>> [REPORT] Consultando pagos en " + PAYMENT_SERVICE_URL + "/api/payments");
            ResponseEntity<List<PagoExternoDTO>> response = restTemplate.exchange(
                PAYMENT_SERVICE_URL + "/api/payments",
                HttpMethod.GET,
                authEntity(token),
                new ParameterizedTypeReference<List<PagoExternoDTO>>() {}
            );
            List<PagoExternoDTO> body = response.getBody() != null ? response.getBody() : new ArrayList<>();
            System.out.println(">>> [REPORT] Pagos recibidos: " + body.size());
            for (PagoExternoDTO p : body) {
                System.out.println("    - Pago id=" + p.getId() + " estado=" + p.getEstado() + " monto=" + p.getMonto() + " fechaPago=" + p.getFechaPago() + " metodo=" + p.getMetodoPago());
            }
            return body;
        } catch (Exception e) {
            System.err.println(">>> [REPORT] Error consultando pagos: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // ===== Generación de reportes con datos reales =====

    private Map<String, Object> generarVentaDiaria(String token, LocalDate fechaInicio, LocalDate fechaFin) {
        Map<String, Object> datos = new LinkedHashMap<>();
        LocalDate desde = fechaInicio != null ? fechaInicio : LocalDate.now();
        LocalDate hasta = fechaFin != null ? fechaFin : desde;

        List<PagoExternoDTO> pagos = obtenerTodosLosPagos(token);
        List<PagoExternoDTO> pagosHoy = pagos.stream()
            .filter(p -> "PAGADO".equalsIgnoreCase(p.getEstado()))
            .filter(p -> p.getFechaPago() != null
                && !p.getFechaPago().toLocalDate().isBefore(desde)
                && !p.getFechaPago().toLocalDate().isAfter(hasta))
            .toList();

        BigDecimal totalVendido = pagosHoy.stream()
            .map(PagoExternoDTO::getMonto)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agrupar por método de pago
        Map<String, Long> conteoMetodos = pagosHoy.stream()
            .collect(Collectors.groupingBy(
                p -> p.getMetodoPago() != null ? p.getMetodoPago() : "DESCONOCIDO",
                Collectors.counting()
            ));

        long totalTransacciones = pagosHoy.size();
        List<Map<String, Object>> metodos = new ArrayList<>();
        for (Map.Entry<String, Long> e : conteoMetodos.entrySet()) {
            int porcentaje = totalTransacciones > 0
                ? (int) Math.round((e.getValue() * 100.0) / totalTransacciones)
                : 0;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("nombre", e.getKey());
            m.put("cantidad", e.getValue());
            m.put("porcentaje", porcentaje);
            metodos.add(m);
        }

        datos.put("totalPedidos", totalTransacciones);
        datos.put("totalVendido", totalVendido);
        datos.put("metodoPago", metodos);
        return datos;
    }

    private Map<String, Object> generarProductosMasVendidos(String token) {
        Map<String, Object> datos = new LinkedHashMap<>();
        List<PedidoExternoDTO> pedidos = obtenerTodosLosPedidos(token);

        // Solo pedidos ENTREGADO o PAGADO
        List<PedidoExternoDTO> validos = pedidos.stream()
            .filter(p -> "ENTREGADO".equalsIgnoreCase(p.getEstado())
                || "PAGADO".equalsIgnoreCase(p.getEstado()))
            .toList();

        Map<String, int[]> cantidadPorProducto = new HashMap<>(); // [cantidad, ganancia*100]
        Map<String, BigDecimal> gananciaPorProducto = new HashMap<>();

        for (PedidoExternoDTO p : validos) {
            if (p.getDetalles() == null) continue;
            for (PedidoExternoDTO.DetalleExternoDTO d : p.getDetalles()) {
                String nombre = d.getNombreProducto() != null ? d.getNombreProducto() : "Sin nombre";
                cantidadPorProducto.merge(nombre, new int[]{d.getCantidad()}, (a, b) -> new int[]{a[0] + b[0]});
                BigDecimal sub = d.getSubtotal() != null ? d.getSubtotal() : BigDecimal.ZERO;
                gananciaPorProducto.merge(nombre, sub, BigDecimal::add);
            }
        }

        List<Map<String, Object>> productos = cantidadPorProducto.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", e.getKey());
                m.put("cantidad", e.getValue()[0]);
                m.put("ganancia", gananciaPorProducto.getOrDefault(e.getKey(), BigDecimal.ZERO));
                return m;
            })
            .sorted((a, b) -> Integer.compare((int) b.get("cantidad"), (int) a.get("cantidad")))
            .limit(10)
            .toList();

        datos.put("productos", productos);
        return datos;
    }

    private Map<String, Object> generarGananciasMensual(String token) {
        Map<String, Object> datos = new LinkedHashMap<>();
        List<PagoExternoDTO> pagos = obtenerTodosLosPagos(token);

        Map<Month, BigDecimal> porMes = new TreeMap<>();
        for (PagoExternoDTO p : pagos) {
            if (!"PAGADO".equalsIgnoreCase(p.getEstado())) continue;
            if (p.getFechaPago() == null) continue;
            Month mes = p.getFechaPago().getMonth();
            BigDecimal monto = p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO;
            porMes.merge(mes, monto, BigDecimal::add);
        }

        List<Map<String, Object>> ganancias = porMes.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("mes", e.getKey().getDisplayName(TextStyle.FULL, new Locale("es")));
                m.put("total", e.getValue());
                return m;
            })
            .toList();

        datos.put("ganancias", ganancias);
        return datos;
    }

    private Map<String, Object> generarDesempenioMeseros(String token) {
        Map<String, Object> datos = new LinkedHashMap<>();
        List<PedidoExternoDTO> pedidos = obtenerTodosLosPedidos(token);

        // Solo pedidos completados
        List<PedidoExternoDTO> validos = pedidos.stream()
            .filter(p -> p.getMeseroNombre() != null && !p.getMeseroNombre().isBlank())
            .filter(p -> "ENTREGADO".equalsIgnoreCase(p.getEstado())
                || "PAGADO".equalsIgnoreCase(p.getEstado()))
            .toList();

        Map<String, long[]> conteoMesero = new HashMap<>();
        Map<String, BigDecimal> gananciaMesero = new HashMap<>();

        for (PedidoExternoDTO p : validos) {
            String nombre = p.getMeseroNombre();
            conteoMesero.merge(nombre, new long[]{1}, (a, b) -> new long[]{a[0] + b[0]});
            BigDecimal total = p.getTotal() != null ? p.getTotal() : BigDecimal.ZERO;
            gananciaMesero.merge(nombre, total, BigDecimal::add);
        }

        List<Map<String, Object>> meseros = conteoMesero.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", e.getKey());
                m.put("pedidos", e.getValue()[0]);
                m.put("ganancia", gananciaMesero.getOrDefault(e.getKey(), BigDecimal.ZERO));
                return m;
            })
            .sorted((a, b) -> Long.compare((long) b.get("pedidos"), (long) a.get("pedidos")))
            .toList();

        datos.put("meseros", meseros);
        return datos;
    }

    private String convertToJson(Map<String, Object> datos) {
        try {
            return objectMapper.writeValueAsString(datos);
        } catch (Exception e) {
            return "{}";
        }
    }

    private ReporteResponse toResponse(Reporte reporte) {
        return ReporteResponse.builder()
            .id(reporte.getId())
            .nombre(reporte.getNombre())
            .tipo(reporte.getTipo().toString())
            .descripcion(reporte.getDescripcion())
            .fechaCreacion(reporte.getFechaCreacion().toString())
            .usuarioId(reporte.getUsuarioId())
            .datosJson(reporte.getDatosJson())
            .build();
    }
}
