package sv.edu.udb.dwf.menuservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import sv.edu.udb.dwf.menuservice.model.Categoria;
import sv.edu.udb.dwf.menuservice.model.Producto;
import sv.edu.udb.dwf.menuservice.repository.ProductoRepository;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductoRepository repo;

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        repo.saveAll(List.of(
            // Pizzas
            Producto.builder().nombre("Margherita").descripcion("Salsa de tomate, mozzarella fresca y albahaca").precio(new BigDecimal("8.50")).categoria(Categoria.PIZZAS).disponible(true).build(),
            Producto.builder().nombre("Pepperoni").descripcion("Salsa de tomate, mozzarella y pepperoni italiano").precio(new BigDecimal("9.50")).categoria(Categoria.PIZZAS).disponible(true).build(),
            Producto.builder().nombre("Cuatro Quesos").descripcion("Mozzarella, parmesano, gorgonzola y ricotta").precio(new BigDecimal("10.50")).categoria(Categoria.PIZZAS).disponible(true).build(),
            Producto.builder().nombre("Vegetariana").descripcion("Pimientos, champiñones, aceitunas, cebolla y tomate").precio(new BigDecimal("9.00")).categoria(Categoria.PIZZAS).disponible(true).build(),
            Producto.builder().nombre("Diavola").descripcion("Salsa picante, mozzarella, salame piccante y chile").precio(new BigDecimal("10.00")).categoria(Categoria.PIZZAS).disponible(true).build(),
            // Pastas
            Producto.builder().nombre("Spaghetti Carbonara").descripcion("Spaghetti con huevo, panceta, parmesano y pimienta negra").precio(new BigDecimal("8.00")).categoria(Categoria.PASTAS).disponible(true).build(),
            Producto.builder().nombre("Fettuccine Alfredo").descripcion("Fettuccine en salsa de mantequilla y parmesano").precio(new BigDecimal("8.50")).categoria(Categoria.PASTAS).disponible(true).build(),
            Producto.builder().nombre("Penne Arrabbiata").descripcion("Penne con salsa de tomate picante y ajo").precio(new BigDecimal("7.50")).categoria(Categoria.PASTAS).disponible(true).build(),
            // Entradas
            Producto.builder().nombre("Bruschetta").descripcion("Pan tostado con tomate fresco, ajo y albahaca").precio(new BigDecimal("4.50")).categoria(Categoria.ENTRADAS).disponible(true).build(),
            Producto.builder().nombre("Tabla de Antipasto").descripcion("Selección de embutidos, quesos y aceitunas italianas").precio(new BigDecimal("7.00")).categoria(Categoria.ENTRADAS).disponible(true).build(),
            // Postres
            Producto.builder().nombre("Tiramisú").descripcion("Clásico tiramisú con mascarpone y café").precio(new BigDecimal("5.00")).categoria(Categoria.POSTRES).disponible(true).build(),
            Producto.builder().nombre("Panna Cotta").descripcion("Panna cotta con coulis de frutos rojos").precio(new BigDecimal("4.50")).categoria(Categoria.POSTRES).disponible(true).build(),
            // Bebidas
            Producto.builder().nombre("Agua Mineral").descripcion("Agua mineral con o sin gas 500ml").precio(new BigDecimal("1.50")).categoria(Categoria.BEBIDAS).disponible(true).build(),
            Producto.builder().nombre("Limonada").descripcion("Limonada fresca con hierbabuena").precio(new BigDecimal("2.50")).categoria(Categoria.BEBIDAS).disponible(true).build(),
            Producto.builder().nombre("Café Espresso").descripcion("Espresso italiano doble").precio(new BigDecimal("2.00")).categoria(Categoria.BEBIDAS).disponible(true).build()
        ));

        System.out.println("Menú inicial cargado: " + repo.count() + " productos.");
    }
}
