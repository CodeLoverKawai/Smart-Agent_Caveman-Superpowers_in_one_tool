# Ada Aider

**Ada-Aider** es un sistema de habilidades unificado, modular y altamente eficiente en el uso de tokens para asistentes de codificación de Inteligencia Artificial (como Claude Code, Cursor, Cline, Windsurf y Antigravity). 

Fusiona la **disciplina operativa de Superpowers** (diseño, planificación ágil, TDD, depuración y verificación estricta) con la **comunicación ultra-abreviada de Caveman** (reducción de hasta un 75% en tokens de salida) sin perder precisión técnica.

---

## Características Principales

### 1. Ultra-Compresión de Respuestas (Chat Terse)
- Elimina palabras de relleno, artículos y saludos innecesarios en la conversación con el agente.
- Modos ajustables: `lite`, `full` (por defecto) y `ultra`.
- **Regla de Claridad de Artefactos**: La compresión se suspende automáticamente al escribir o modificar planes de desarrollo (`implementation_plan.md`), listas de tareas (`task.md`) y especificaciones técnicas para garantizar que sean completamente legibles.

### 2. Ciclo de Desarrollo Riguroso (Fases Claras)
- **Diseño Simplificado (`ada-brainstorm`)**: Preguntas creativas una a la vez para evitar saturación.
- **Nano-Planificación (`ada-plan`)**: Generación de planes ultra-cortos con tablas de impacto directo.
- **TDD Estricto (`ada-code`)**: Ciclo RED-GREEN-REFACTOR obligatorio para todo nuevo código de producción.
- **Evidencia antes de Afirmaciones (`ada-verify`)**: Verificación obligatoria de pruebas, compiladores y código de salida (`exit code`) antes de marcar una tarea como completada.

### 3. Ahorro de Tokens del Sistema (Input Tokens)
- Las propias instrucciones de las habilidades (`SKILL.md`) están escritas con prosa altamente comprimida, consumiendo un **80% menos tokens de contexto inicial** en comparación con los frameworks tradicionales.
- Incorpora un contador de ahorro de caracteres acumulados visible directamente en la barra de estado de Claude Code.

---

## Estructura del Proyecto

```
Ada-Aider/
├── README.md                 # Este documento
├── LICENSE                   # Licencia GPL v3
├── NOTICE.md                 # Créditos y atribuciones a proyectos originales (MIT)
├── gemini-extension.json     # Metadatos del plugin para Antigravity
├── GEMINI.md                 # Índice de carga de habilidades de Antigravity
├── package.json              # Configuración y binding del instalador
│
├── bin/
│   └── install.js            # Instalador idempotente y seguro contra enlaces simbólicos (symlinks)
│
├── skills/                   # Instrucciones comprimidas para el agente
│   ├── ada-agent/          # Bootstrap global y reglas de compresión
│   ├── ada-brainstorm/     # Fase creativa y preguntas de opción múltiple
│   ├── ada-plan/           # Formato de "Nano-Planes" eficientes en tokens
│   ├── ada-code/           # TDD y bucle RED-GREEN-REFACTOR
│   ├── ada-verify/         # Evidencia dura y comandos de prueba
│   ├── ada-commit/         # Generador de commits convencionales ultra-terse
│   ├── ada-review/         # Comentarios de revisión de código en una línea
│   ├── ada-debug/          # Depuración sistemática orientada a hipótesis
│   ├── ada-taste/          # Pautas frontend y diseño anti-slop
│   ├── ada-security/       # Checklists de seguridad y sandbox
│   ├── ada-mcp/            # Integración de servidores Model Context Protocol
│   ├── ada-mem/            # Compactación y gestión de memoria de contexto
│   ├── ada-telemetry/      # Monitoreo y trazabilidad de errores
│   ├── ada-release/        # Despliegues automatizados y checklists de lanzamiento
│   ├── ada-db/             # Diseño de base de datos, optimización y migraciones
│   ├── ada-proactive/      # Tareas proactivas y monitoreo en segundo plano
│   └── ada-hardware/       # Desarrollo firmware y diseño RTL de hardware
│
└── src/
    ├── hooks/                # Integraciones nativas de Claude Code
    │   ├── ada-config.js   # Manejo seguro de archivos de estado
    │   ├── ada-stats.js    # Calculador de ahorro y parser de transcripts .jsonl
    │   ├── ada-activate.js # SessionStart: activa el bootstrap y actualiza estadísticas
    │   ├── ada-tracker.js  # UserPromptSubmit: intercepta comandos y suspende compresión
    │   └── ada-statusline.sh # Script Bash para renderizar el badge [ADA:MODE] ⛏ SAVINGS
```q

---

## Guía de Instalación

### 1. Claude Code (CLI)
Desde la raíz del proyecto, ejecuta el instalador para configurar de forma segura tus hooks y la barra de estado en `~/.claude/settings.json`:

```bash
node bin/install.js
```

### 2. IDEs (Cursor / Cline / Windsurf)
Copia el contenido del archivo `src/rules/ada-agent-rules.md` (o las instrucciones consolidadas) directamente en el archivo de reglas global de tu espacio de trabajo:
- **Cursor**: `.cursorrules`
- **Cline**: `.clinerules`
- **Windsurf**: `.windsurfrules`

### 3. Google Antigravity
Copia la carpeta del proyecto a tu directorio de plugins globales de Antigravity:

```bash
mkdir -p ~/.gemini/config/plugins/
cp -r . ~/.gemini/config/plugins/ada-agent
```
*Nota: Recuerda reiniciar la terminal o el cliente de Antigravity para que indexe las nuevas habilidades.*

---

## Comandos y Activación

### Comandos Slash (Chat de Claude Code / Antigravity)
- `/ada` o `/ada-agent` — Muestra el estado del agente y modo activo.
- `/ada [lite\|full\|ultra]` — Cambia el nivel de compresión.
- `/ada stats` — Muestra turnos, caracteres procesados y el ahorro acumulado de la sesión.
- `/ada off` — Desactiva por completo el modo abreviado.

### Frases de Activación en Lenguaje Natural
- **Activar**: *"talk like caveman"*, *"use ada-agent"*, *"activate ada-agent"*.
- **Desactivar**: *"normal mode"*, *"stop ada-agent"*, *"deactivate ada-agent"*.

---

## Licencia y Créditos
Este proyecto se distribuye bajo la licencia **GNU General Public License v3 (GPL v3)**. 

Contiene porciones de código e instrucciones derivadas de los siguientes proyectos originales bajo licencia MIT:
- **Superpowers** (Copyright (c) 2025 Jesse Vincent)
- **Caveman** (Copyright (c) 2026 Julius Brussee)
- **Taste-Skill** (Copyright (c) 2026 Leonxlnx)
- **Claude-Mem** (Copyright (c) 2026 thedotmack)
- **Sentry-Workflow** (Copyright (c) 2026 Getsentry)
- **Agent-Skills** (Copyright (c) 2026 Addy Osmani)
- **Harmonist** (Copyright (c) 2026 GammaLabTechnologies)

Consulte [NOTICE.md](NOTICE.md) para más detalles.
