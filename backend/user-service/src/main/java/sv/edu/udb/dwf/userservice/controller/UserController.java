package sv.edu.udb.dwf.userservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sv.edu.udb.dwf.userservice.dto.UserRequest;
import sv.edu.udb.dwf.userservice.dto.UserResponse;
import sv.edu.udb.dwf.userservice.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> listar() {
        return ResponseEntity.ok(userService.listarUsuarios());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody UserRequest request) {
        try {
            return ResponseEntity.ok(userService.crearUsuario(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        try {
            return ResponseEntity.ok(userService.editarUsuario(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.cambiarEstado(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
