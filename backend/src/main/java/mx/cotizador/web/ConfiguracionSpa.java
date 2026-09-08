package mx.cotizador.web;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * El frontend Angular usa rutas de navegador (no "#"), así que recargar la página en
 * una ruta como /perfil o /cotizaciones/5 debe servir igual el index.html compilado
 * (Angular Router toma el control desde ahí). Las rutas /api/** no pasan por aquí
 * porque los controladores REST tienen prioridad.
 */
@Configuration
public class ConfiguracionSpa implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource recurso = location.createRelative(resourcePath);
                        if (recurso.exists() && recurso.isReadable()) {
                            return recurso;
                        }
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
