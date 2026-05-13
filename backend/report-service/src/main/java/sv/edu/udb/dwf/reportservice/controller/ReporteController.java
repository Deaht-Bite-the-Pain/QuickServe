package sv.edu.udb.dwf.reportservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.reportservice.dto.GenerarReporteRequest;
import sv.edu.udb.dwf.reportservice.dto.PlantillaReporte;
import sv.edu.udb.dwf.reportservice.dto.ReporteResponse;
import sv.edu.udb.dwf.reportservice.security.JwtUtil;
import sv.edu.udb.dwf.reportservice.service.ReporteService;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService service;
    private final JwtUtil jwtUtil;

    @GetMapping("/plantillas")
    public ResponseEntity<List<PlantillaReporte>> obtenerPlantillas() {
        return ResponseEntity.ok(service.obtenerPlantillas());
    }

    @GetMapping
    public ResponseEntity<List<ReporteResponse>> listarReportes(HttpServletRequest request) {
        Long usuarioId = extractUsuarioId(request);
        return ResponseEntity.ok(service.listarReportesDelUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<ReporteResponse> generarReporte(
            @Valid @RequestBody GenerarReporteRequest req,
            HttpServletRequest request) {
        Long usuarioId = extractUsuarioId(request);
        String usuarioNombre = extractUsuarioNombre(request);
        String token = extractToken(request);
        ReporteResponse reporte = service.generarReporte(req, usuarioId, usuarioNombre, token);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReporteResponse> obtenerReporte(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerReporte(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReporte(@PathVariable Long id) {
        service.eliminarReporte(id);
        return ResponseEntity.noContent().build();
    }

    private Long extractUsuarioId(HttpServletRequest request) {
        String token = extractToken(request);
        return jwtUtil.extractClaims(token).get("id", Long.class);
    }

    private String extractUsuarioNombre(HttpServletRequest request) {
        String token = extractToken(request);
        return jwtUtil.extractClaims(token).get("nombre", String.class);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Falta el token de autenticación o tiene formato inválido"
            );
        }
        return header.substring(7);
    }
}
