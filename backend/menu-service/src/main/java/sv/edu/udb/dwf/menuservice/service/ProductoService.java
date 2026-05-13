package sv.edu.udb.dwf.menuservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sv.edu.udb.dwf.menuservice.dto.ProductoRequest;
import sv.edu.udb.dwf.menuservice.dto.ProductoResponse;
import sv.edu.udb.dwf.menuservice.model.Categoria;
import sv.edu.udb.dwf.menuservice.model.Producto;
import sv.edu.udb.dwf.menuservice.repository.ProductoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository repo;

    public List<ProductoResponse> listar() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public List<ProductoResponse> listarDisponibles() {
        return repo.findByDisponible(true).stream().map(this::toResponse).toList();
    }

    public List<ProductoResponse> listarPorCategoria(Categoria categoria) {
        return repo.findByCategoria(categoria).stream().map(this::toResponse).toList();
    }

    public List<ProductoResponse> listarDisponiblesPorCategoria(Categoria categoria) {
        return repo.findByCategoriaAndDisponible(categoria, true).stream().map(this::toResponse).toList();
    }

    public ProductoResponse crear(ProductoRequest req) {
        Producto p = Producto.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .precio(req.getPrecio())
                .categoria(req.getCategoria())
                .disponible(req.isDisponible())
                .build();
        return toResponse(repo.save(p));
    }

    public ProductoResponse editar(Long id, ProductoRequest req) {
        Producto p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio());
        p.setCategoria(req.getCategoria());
        p.setDisponible(req.isDisponible());
        return toResponse(repo.save(p));
    }

    public ProductoResponse toggleDisponibilidad(Long id) {
        Producto p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        p.setDisponible(!p.isDisponible());
        return toResponse(repo.save(p));
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    private ProductoResponse toResponse(Producto p) {
        return ProductoResponse.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .categoria(p.getCategoria())
                .disponible(p.isDisponible())
                .build();
    }
}
