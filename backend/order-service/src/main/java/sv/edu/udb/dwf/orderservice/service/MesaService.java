package sv.edu.udb.dwf.orderservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sv.edu.udb.dwf.orderservice.model.Mesa;
import sv.edu.udb.dwf.orderservice.repository.MesaRepository;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository repo;
    private final Random random = new Random();

    /**
     * Asigna aleatoriamente una mesa disponible y la marca como ocupada.
     * Transaccional para evitar que dos solicitudes simultáneas obtengan la misma mesa.
     */
    @Transactional
    public synchronized String asignarMesa() {
        List<Mesa> disponibles = repo.findByDisponibleTrue();
        if (disponibles.isEmpty()) {
            throw new RuntimeException("No hay mesas disponibles en este momento. Por favor esperá un momento e intentá de nuevo.");
        }
        Mesa mesa = disponibles.get(random.nextInt(disponibles.size()));
        mesa.setDisponible(false);
        repo.save(mesa);
        return String.valueOf(mesa.getNumero());
    }

    /**
     * Libera una mesa (la vuelve disponible) una vez que el pago fue procesado.
     */
    @Transactional
    public void liberarMesa(String numeroMesa) {
        if (numeroMesa == null || numeroMesa.isBlank()) return;
        try {
            int numero = Integer.parseInt(numeroMesa.trim());
            repo.findByNumero(numero).ifPresent(m -> {
                m.setDisponible(true);
                repo.save(m);
                System.out.println("✓ Mesa " + numero + " liberada.");
            });
        } catch (NumberFormatException e) {
            System.err.println("Número de mesa inválido: " + numeroMesa);
        }
    }

    public int contarDisponibles() {
        return repo.findByDisponibleTrue().size();
    }

    public List<Integer> listarDisponibles() {
        return repo.findByDisponibleTrue()
                .stream()
                .map(Mesa::getNumero)
                .sorted()
                .toList();
    }
}
