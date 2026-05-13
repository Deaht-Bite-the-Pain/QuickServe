package sv.edu.udb.dwf.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import sv.edu.udb.dwf.userservice.model.Role;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nombre;
    private String email;
    private Role rol;
    private boolean activo;
}
