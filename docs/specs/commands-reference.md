# Guía de Comandos: Smart-Agent Unified Skills System

Esta es la referencia completa de todos los comandos y frases de activación admitidos por el sistema **`smart-agent`**.

---

## 1. Comando de Instalación
Ejecuta esto desde la raíz del directorio `/home/rousseau/Downloads/Skills/smart-agent/` para instalar los hooks e integrar el badge de barra de estado en Claude Code:

```bash
node bin/install.js
```

---

## 2. Comandos Slash (Dentro del Chat de Claude Code)
Puedes controlar el comportamiento del agente directamente desde el chat utilizando el comando principal `/smart-agent` o su alias corto `/smart`:

| Comando | Acción | Descripción |
| :--- | :--- | :--- |
| `/smart` o `/smart-agent` | **Verificar Estado** | Muestra si el modo abreviado está activo y qué nivel tiene configurado. |
| `/smart lite` o `/smart-agent lite` | **Modo Lite** | Activa compresión moderada: lenguaje profesional y directo sin artículos de relleno ni rodeos, manteniendo oraciones completas. |
| `/smart full` o `/smart-agent full` | **Modo Full** | Activa el estilo abreviado clásico (caveman inteligente): elimina artículos (a/an/the) y permite el uso de fragmentos técnicos precisos. |
| `/smart ultra` o `/smart-agent ultra` | **Modo Ultra** | Activa compresión máxima: abrevia términos comunes de programación (auth, DB, fn, impl) y usa flechas de causalidad (`X → Y`). |
| `/smart stats` o `/smart-agent stats` | **Ver Estadísticas** | Escanea los logs de sesión (`.jsonl`), calcula el ahorro incremental y muestra el total de caracteres/tokens ahorrados. |
| `/smart off` o `/smart-agent off` | **Desactivar** | Desactiva por completo el modo abreviado y vuelve a la redacción normal de respuestas. |

---

## 3. Frases de Activación en Lenguaje Natural
El tracker también intercepta mensajes normales para activar o desactivar la compresión sin necesidad de usar comandos slash:

### Para Activar (Modo por Defecto):
- *"talk like caveman"*
- *"use smart-agent"*
- *"activate smart-agent"*
- *"enable smart-agent"*
- *"turn on smart-agent"*

### Para Desactivar:
- *"normal mode"*
- *"stop smart-agent"*
- *"disable smart-agent"*
- *"deactivate smart-agent"*
- *"turn off smart-agent"*

---

## 4. Ejecución de Pruebas Automatizadas
Para validar que todos los hooks, parser de configuración, instalador y lógica de estadísticas funcionan correctamente:

```bash
# Correr toda la suite de pruebas unitarias e integración
node --test tests/*.test.js
```
