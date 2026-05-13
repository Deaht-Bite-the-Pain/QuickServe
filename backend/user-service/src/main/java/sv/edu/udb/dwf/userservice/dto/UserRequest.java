package sv.edu.udb.dwf.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import sv.edu.udb.dwf.userservice.model.Role;

@Data
public class UserRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(
        regexp = "^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$",
        message = "El nombre solo puede contener letras y espacios"
    )
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    @Size(max = 150, message = "El email no puede superar 150 caracteres")
    private String email;

    // Requerida solo al crear; opcional al editar (se valida en el service)
    @Size(min = 8, max = 100, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
        message = "La contraseña debe tener al menos una mayúscula y un número"
    )
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Role rol;
}
