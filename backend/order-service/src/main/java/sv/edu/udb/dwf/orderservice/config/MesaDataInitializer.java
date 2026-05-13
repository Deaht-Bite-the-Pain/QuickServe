package sv.edu.udb.dwf.orderservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sv.edu.udb.dwf.orderservice.model.Mesa;
import sv.edu.udb.dwf.orderservice.repository.MesaRepository;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
@RequiredArgsConstructor
public class MesaDataInitializer implements CommandLineRunner {

    private final MesaRepository mesaRepository;

    @Override
    public void run(String... args) {
        if (mesaRepository.count() == 0) {
            var mesas = IntStream.rangeClosed(1, 20)
                    .mapToObj(i -> Mesa.builder().numero(i).disponible(true).build())
                    .collect(Collectors.toList());
            mesaRepository.saveAll(mesas);
            System.out.println("✓ 20 mesas inicializadas en el sistema.");
        }
    }
}
