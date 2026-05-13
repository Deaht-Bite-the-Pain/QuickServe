package sv.edu.udb.dwf.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String nombre;
    private String email;
    private String rol;
}
