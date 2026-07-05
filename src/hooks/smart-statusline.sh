#!/bin/bash
# smart-agent — statusline badge script for Claude Code

BASE_DIR="${CLAUDE_CONFIG_DIR:-$HOME}"
FLAG="$BASE_DIR/.smart-agent-active"
SAVINGS_FILE="$BASE_DIR/.smart-stats-savings"

# Securely checks that neither file is a symlink (refuses/aborts if [ -L "$file" ])
[ -L "$FLAG" ] && exit 0
[ -L "$SAVINGS_FILE" ] && exit 0

# If FLAG file doesn't exist, we exit 0
[ ! -f "$FLAG" ] && exit 0

# Read mode from flag safely (limit to 64 bytes and sanitize)
MODE=$(head -c 64 "$FLAG" 2>/dev/null | tr -d '\n\r' | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')

# Whitelist of valid modes
case "$MODE" in
  lite|full|ultra) ;;
  *) exit 0 ;;
esac

# Convert mode to uppercase for display
MODE_UPPER=$(printf '%s' "$MODE" | tr '[:lower:]' '[:upper:]')

# Outputs a colored badge [SMART:MODE] using orange color
printf '\033[38;5;172m[SMART:%s]\033[0m' "$MODE_UPPER"

# Appends the accumulated savings (e.g., ⛏ 12.4k if savings are found)
if [ -f "$SAVINGS_FILE" ]; then
  # Read savings safely (limit to 64 bytes and sanitize to digits only)
  SAVINGS_RAW=$(head -c 64 "$SAVINGS_FILE" 2>/dev/null | tr -cd '0-9')
  if [ -n "$SAVINGS_RAW" ]; then
    if [ "$SAVINGS_RAW" -ge 1000 ]; then
      INTEGER=$(( SAVINGS_RAW / 1000 ))
      DECIMAL=$(( (SAVINGS_RAW % 1000) / 100 ))
      SAVINGS_STR="${INTEGER}.${DECIMAL}k"
    else
      SAVINGS_STR="${SAVINGS_RAW}"
    fi
    # Append the savings with the pickaxe symbol
    printf ' \033[38;5;172m⛏ %s\033[0m' "$SAVINGS_STR"
  fi
fi
