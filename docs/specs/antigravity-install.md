# Guía de Instalación en Antigravity (Gemini/CLI)

Este documento detalla los pasos para instalar y activar el plugin **`ada-agent`** en tu entorno global de Google Antigravity.

---

## 1. Requisitos Previos
- Tener instalado y configurado Google Antigravity.
- El directorio de configuración global de Antigravity debe estar en:
  `~/.gemini/config/` (o la ruta correspondiente en tu sistema operativo).

---

## 2. Archivos del Plugin Necesarios
Para que Antigravity reconozca y cargue las habilidades, la carpeta del plugin debe contener estos archivos en su raíz:
- `gemini-extension.json`: Define el metadato del plugin.
- `GEMINI.md`: Indica la directiva de carga de todas las habilidades del directorio `skills/`.
- `plugin.json` e `installed_version.json`: Metadatos requeridos para la indexación automática del motor.
- `skills/`: Carpeta con los directorios de cada habilidad (`ada-agent`, `ada-brainstorm`, `ada-plan`, etc.).

---

## 3. Proceso de Instalación

### Paso 1: Copiar la carpeta del plugin
Copia la carpeta del proyecto a la ruta de plugins globales de Antigravity:

```bash
# Crear directorio de plugins si no existe
mkdir -p ~/.gemini/config/plugins/

# Copiar el plugin ada-agent
cp -r /home/rousseau/Downloads/Skills/ada-agent ~/.gemini/config/plugins/ada-agent
```

### Paso 2: Recargar Antigravity
El motor de Antigravity indexa las habilidades únicamente al inicio de la sesión. 

1. Cierra tu cliente/consola de Antigravity actual.
2. Abre una nueva terminal.
3. Inicia una nueva conversación o proyecto.

---

## 4. Confirmación de Carga
Al iniciar una nueva conversación, Antigravity mostrará las habilidades cargadas al principio del contexto del sistema. Deberías ver las siguientes habilidades en la lista de `Available skills`:
- `ada-agent`
- `ada-brainstorm`
- `ada-plan`
- `ada-code`
- `ada-verify`
- `ada-commit`
- `ada-review`
