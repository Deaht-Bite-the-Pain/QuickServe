package sv.edu.udb.dwf.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sv.edu.udb.dwf.paymentservice.model.EstadoPago;
import sv.edu.udb.dwf.paymentservice.model.Pago;
import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByPedidoId(Long pedidoId);
    List<Pago> findByEstado(EstadoPago estado);
}
