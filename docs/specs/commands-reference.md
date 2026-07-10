# Guía de Comandos: Ada-Aider Unified Skills System

Esta es la referencia completa de todos los comandos y frases de activación admitidos por el sistema **`ada-agent`**.

---

## 1. Comando de Instalación
Ejecuta esto desde la raíz del directorio `/home/rousseau/Downloads/Skills/ada-agent/` para instalar los hooks e integrar el badge de barra de estado en Claude Code:

```bash
node bin/install.js
```

---

## 2. Comandos Slash (Dentro del Chat de Claude Code)
Puedes controlar el comportamiento del agente directamente desde el chat utilizando el comando principal `/ada-agent` o su alias corto `/ada`:

| Comando | Acción | Descripción |
| :--- | :--- | :--- |
| `/ada` o `/ada-agent` | **Verificar Estado** | Muestra si el modo abreviado está activo y qué nivel tiene configurado. |
| `/ada lite` o `/ada-agent lite` | **Modo Lite** | Activa compresión moderada: lenguaje profesional y directo sin artículos de relleno ni rodeos, manteniendo oraciones completas. |
| `/ada full` o `/ada-agent full` | **Modo Full** | Activa el estilo abreviado clásico (caveman inteligente): elimina artículos (a/an/the) y permite el uso de fragmentos técnicos precisos. |
| `/ada ultra` o `/ada-agent ultra` | **Modo Ultra** | Activa compresión máxima: abrevia términos comunes de programación (auth, DB, fn, impl) y usa flechas de causalidad (`X → Y`). |
| `/ada stats` o `/ada-agent stats` | **Ver Estadísticas** | Escanea los logs de sesión (`.jsonl`), calcula el ahorro incremental y muestra el total de caracteres/tokens ahorrados. |
| `/ada off` o `/ada-agent off` | **Desactivar** | Desactiva por completo el modo abreviado y vuelve a la redacción normal de respuestas. |

---

## 3. Frases de Activación en Lenguaje Natural
El tracker también intercepta mensajes normales para activar o desactivar la compresión sin necesidad de usar comandos slash:

### Para Activar (Modo por Defecto):
- *"talk like caveman"*
- *"use ada-agent"*
- *"activate ada-agent"*
- *"enable ada-agent"*
- *"turn on ada-agent"*

### Para Desactivar:
- *"normal mode"*
- *"stop ada-agent"*
- *"disable ada-agent"*
- *"deactivate ada-agent"*
- *"turn off ada-agent"*

---

## 4. Ejecución de Pruebas Automatizadas
Para validar que todos los hooks, parser de configuración, instalador y lógica de estadísticas funcionan correctamente:

```bash
# Correr toda la suite de pruebas unitarias e integración
node --test tests/*.test.js
```
