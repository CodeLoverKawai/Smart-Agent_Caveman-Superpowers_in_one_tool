# Spec: Ada-Aider Unified Skills System

Date: 2026-07-02
Topic: ada-agent-unified-skills

## Goal Description
Create a unified, modular, and highly token-efficient coding assistant skills system (`ada-agent`) that combines the agent discipline of `superpowers` (brainstorming, planning, TDD, debugging, and verification) with the high-information-density communication rules of `caveman` (compressing chat responses while keeping precise technical details).

## Proposed Architecture

### 1. File Structure
The project will be housed in `/home/rousseau/Downloads/Skills/ada-agent/`:
- `package.json`: Definición del paquete e instalador.
- `CLAUDE.md`: Instrucciones de desarrollo para el agente en este repositorio.
- `skills/`: Contiene cada una de las sub-skills.
  - `ada-agent/SKILL.md`: Bootstrap e interacción global de modo abreviado.
  - `ada-brainstorm/SKILL.md`: Diseño simplificado una pregunta a la vez.
  - `ada-plan/SKILL.md`: Planificación con Nano-Planes legibles y cortos.
  - `ada-code/SKILL.md`: Ciclo RED-GREEN-REFACTOR de TDD integrado.
  - `ada-verify/SKILL.md`: Verificación estricta con evidencia.
  - `ada-commit/SKILL.md`: Generador de commits cortos.
  - `ada-review/SKILL.md`: Generador de revisiones en una sola línea.
- `src/hooks/`:
  - `ada-config.js`: Manejo de archivos de estado de modo activo y cálculo de rutas seguras.
  - `ada-activate.js`: Hook `SessionStart` para registrar reglas iniciales.
  - `ada-tracker.js`: Hook `UserPromptSubmit` para registrar comandos slash y autocompletados.
  - `ada-statusline.sh`: Script de barra de estado en Bash.
  - `ada-stats.js`: Contador de ahorro de tokens multiplataforma.

### 2. Core Components Specification

#### A. Bootstrap Skill (`skills/ada-agent/SKILL.md`)
- Activación en el chat mediante comandos slash (`/ada`, `/ada-agent [lite|full|ultra]`).
- Habilita la compresión de respuestas según el nivel seleccionado:
  - `lite`: Oraciones completas, lenguaje formal pero sin palabras de relleno ni rodeos.
  - `full`: Modo abreviado tradicional (omite artículos y fragmentos de texto permitidos).
  - `ultra`: Abreviación máxima de palabras comunes y representación por flechas de causalidad.
- **Regla de Consistencia de Artefactos**: Desactiva automáticamente el modo abreviado al crear, actualizar o modificar archivos del sistema de planificación (`implementation_plan.md`, `task.md`, `walkthrough.md`, especificaciones técnicas) para que el usuario humano pueda revisarlos sin ambigüedades.

#### B. Sub-Skills de Flujo de Trabajo
- **`ada-brainstorm`**: Restringe la etapa creativa a preguntas puntuales de opción múltiple de una en una. Exige descomponer grandes problemas antes de iniciar.
- **`ada-plan`**: Introduce los **Nano-Planes**, los cuales eliminan descripciones redundantes de archivos y usan una tabla de impacto directo (`[+]` para agregar, `[*]` para modificar, `[-]` para borrar).
- **`ada-code`**: Integra TDD estricto. Prohíbe cualquier adición o cambio en código de producción que no sea validada inmediatamente por una prueba unitaria o de integración.
- **`ada-verify`**: Fuerza al agente a ejecutar comandos completos de prueba y verificar el `exit code` y conteo de fallos antes de reportar un estado verde.

#### C. Integración y Cálculo de Estadísticas (`ada-stats`)
- Los hooks para Claude Code interceptan el inicio y los prompts para mantener el estado en `$CLAUDE_CONFIG_DIR/.ada-agent-active`.
- El script de estadísticas calcula los caracteres y palabras que se emitieron versus una respuesta normal e incrementa el contador en `$CLAUDE_CONFIG_DIR/.ada-stats-savings`.

## Verification Plan

### Automated Tests
- Scripts de prueba unitaria en Node.js para el parser de configuración y el tracker de comandos en `tests/`.
- Verificación del comportamiento del tracker frente a comandos slash (`/ada-agent full`, `/ada-agent off`).

### Manual Verification
- Carga de las habilidades de forma simulada en una conversación de agente para validar la adherencia a la compresión sin romper la consistencia de los planes.
