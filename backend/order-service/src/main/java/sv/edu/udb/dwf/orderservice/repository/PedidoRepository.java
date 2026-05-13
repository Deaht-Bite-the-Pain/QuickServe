package sv.edu.udb.dwf.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sv.edu.udb.dwf.orderservice.model.EstadoPedido;
import sv.edu.udb.dwf.orderservice.model.Pedido;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByEstado(EstadoPedido estado);
    List<Pedido> findByMeseroId(Long meseroId);
    List<Pedido> findByEstadoIn(List<EstadoPedido> estados);
    List<Pedido> findByMeseroIdAndEstadoIn(Long meseroId, List<EstadoPedido> estados);
}
