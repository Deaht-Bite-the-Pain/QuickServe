package sv.edu.udb.dwf.userservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sv.edu.udb.dwf.userservice.model.Role;
import sv.edu.udb.dwf.userservice.model.User;
import sv.edu.udb.dwf.userservice.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        crearSiNoExiste("Administrador",  "admin@quickserve.com",  "admin123",  Role.ADMIN);
        crearSiNoExiste("Juan Mesero",    "mesero@quickserve.com", "mesero123", Role.MESERO);
        crearSiNoExiste("Chef Cocina",    "cocina@quickserve.com", "cocina123", Role.COCINERO);
        crearSiNoExiste("Carlos Caja",    "cajero@quickserve.com", "cajero123", Role.CAJERO);
    }

    private void crearSiNoExiste(String nombre, String email, String password, Role rol) {
        if (userRepository.existsByEmail(email)) return;
        userRepository.save(User.builder()
                .nombre(nombre)
                .email(email)
                .password(passwordEncoder.encode(password))
                .rol(rol)
                .activo(true)
                .build());
        System.out.println("✅ Usuario creado: " + email + " / " + password);
    }
}
