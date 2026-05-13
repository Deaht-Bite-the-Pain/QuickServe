package sv.edu.udb.dwf.reportservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("============================================");
        System.out.println(">>> CARGANDO SecurityConfig de report-service <<<");
        System.out.println("============================================");
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reports/plantillas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reports").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/reports").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/reports/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/reports/**").hasRole("ADMIN")
                .anyRequest().denyAll()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) ->
                response.sendError(401, "Unauthorized")
            ))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
