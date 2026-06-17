# SmartLogix - Plataforma Inteligente para Gestión Logística (Fullstack)

Proyecto para el caso semestral de Informática (Entrega Evaluación Parcial 2).
Evolución del sistema a un entorno distribuido que integra una aplicación Frontend (NPM) con el ecosistema de microservicios (Maven).

**Integrantes:** Renatto Silva, Kevin Mesias  
**Lugar de despliegue:** Taller de Alto Cómputo (TAITE 9)

## Componentes del sistema

### Capa Frontend
- **Aplicación Web (`front/fron_smart_logix`)**: Desarrollada sobre entorno **NPM** (React / Vite). Implementa una arquitectura por capas (Presentación, Custom Hooks y Servicios con Axios). Usa **Zod** para la validación de esquemas en formularios CRUD antes del envío de datos.

### Capa Backend (Microservicios)
- Gestión de Inventario (`inventory-service`): Control de stock en tiempo real y SKU.
- Procesamiento de Pedidos (`order-service`): Orquestador síncrono del flujo comercial.
- Coordinación de Envíos (`shipment-service`): Asignación de despachos.

### Infraestructura
- Descubrimiento de servicios (`discovery-service` con Eureka).
- API Gateway (`api-gateway`): Punto único de entrada para el frontend. Valida firmas de tokens.
- Autenticación JWT (`auth-service`): Registro y login de usuarios.

## Patrones de arquitectura implementados

- `Service Discovery`: Registro dinámico con Eureka.
- `API Gateway`: Punto único de entrada para el frontend o clientes externos.
- `Database per Service`: Cada microservicio usa su propia base de datos aislada (H2 en desarrollo / PostgreSQL independientes en el compose).
- `Factory Method`: En `shipment-service` para crear planes de envío según la zona.
- `Circuit Breaker`: En `order-service` para aislar las llamadas hacia `shipment-service`.
- `Synchronous orchestration`: `order-service` coordina de forma secuencial inventario + envío.
- `Arquitectura por Capas`: Estructura del frontend dividiendo la UI de los hooks de estado y lógica de red.

## Estrategia de Branching (GitFlow)

El control de versiones del repositorio se maneja bajo el modelo GitFlow:
- `main`: Código de producción y entregas definitivas de la evaluación.
- `develop`: Rama central para la integración continua de características.
- `feature/*`: Ramas temporales para el desarrollo de módulos específicos (ej. `feature/frontend-zod`), integradas a `develop` mediante Pull Requests.

## Estructura del repositorio y puertos

- `front/fron_smart_logix` (puerto `80` en Docker / `3000` local)
- `discovery-service` (puerto `8761`)
- `api-gateway` (puerto `8080`)
- `auth-service` (puerto interno `8084`)
- `inventory-service` (puerto interno `8081`)
- `order-service` (puerto interno `8082`)
- `shipment-service` (puerto interno `8083`)

## Requisitos

- Java 17
- Node.js & NPM (para ejecución local del frontend)
- Maven Wrapper (`mvnw.cmd` ya incluido)

## Compilar y validar backend

```powershell
.\mvnw.cmd clean test
Docker
Tanto las imágenes de los microservicios (Java 17) como el frontend (Nginx) utilizan multi-stage build para optimizar el entorno de ejecución:

Dockerfile
FROM eclipse-temurin:17-jdk AS build
Para levantar toda la plataforma completa (Frontend + Backend + DBs) con Docker Compose:

PowerShell
docker compose up --build -d
docker compose ps
Para detenerla:

PowerShell
docker compose down
Si Docker Desktop no está ejecutándose, docker compose devolverá un error de conexión al daemon. También puedes usar:

PowerShell
.\run-docker.ps1
Ejecutar (opción 1: manual)
Iniciar en este orden (cada comando en terminal distinta):

PowerShell
# Backend (Maven)
.\mvnw.cmd -pl discovery-service spring-boot:run
.\mvnw.cmd -pl inventory-service spring-boot:run
.\mvnw.cmd -pl shipment-service spring-boot:run
.\mvnw.cmd -pl order-service spring-boot:run
.\mvnw.cmd -pl api-gateway spring-boot:run

# Frontend (NPM)
cd front/fron_smart_logix
npm install
npm run dev
Ejecutar (opción 2: script)
PowerShell
.\run-services.ps1
URLs principales
Interfaz de Usuario (Frontend): http://localhost:80 (Docker) o http://localhost:3000 (Local)

Eureka Dashboard: http://localhost:8761

API Gateway: http://localhost:8080

En Docker Compose solo quedan publicados 80, 8761 y 8080. Los microservicios internos no se exponen al host; el frontend los consume directamente a través del gateway.

Pruebas rápidas por Gateway
1) Obtener token JWT
PowerShell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/auth/login `
  -ContentType "application/json" `
  -Body '{"credential":"admin","password":"admin123"}'

$token = $login.token
Usuarios seed de desarrollo:

admin / admin123

usuario / user123

bodeguero / bodega123

Para producción cambia esas claves con variables de entorno:

SMARTLOGIX_SEED_ADMIN_PASSWORD

SMARTLOGIX_SEED_USER_PASSWORD

SMARTLOGIX_SEED_WAREHOUSE_PASSWORD

JWT_SECRET

2) Listar inventario inicial
PowerShell
Invoke-RestMethod `
  -Uri http://localhost:8080/api/inventory/items `
  -Headers @{ Authorization = "Bearer $token" }
3) Crear un pedido
PowerShell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/orders `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{
    "customerName": "Ana Torres",
    "customerEmail": "ana@cliente.cl",
    "shippingAddress": "Av. Providencia 1234, Santiago",
    "lines": [
      { "sku": "SKU-1001", "quantity": 2, "unitPrice": 29990 },
      { "sku": "SKU-2001", "quantity": 1, "unitPrice": 14990 }
    ]
  }'
4) Ver pedidos
PowerShell
Invoke-RestMethod `
  -Uri http://localhost:8080/api/orders `
  -Headers @{ Authorization = "Bearer $token" }
5) Ver envios
PowerShell
Invoke-RestMethod `
  -Uri http://localhost:8080/api/shipments `
  -Headers @{ Authorization = "Bearer $token" }