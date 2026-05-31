#!/usr/bin/env bash
set -Eeuo pipefail

project_name="helpps"
default_port="5173"
app_port=""
open_browser="yes"
action="start"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$script_dir"
compose_file="$project_root/docker-compose.yml"

banner() {
  cat <<'EOF'
+--------------------------------------+
|  HELPPS ONE-CLICK RUNNER             |
|  Safety Mind support platform        |
+--------------------------------------+
EOF
}

usage() {
  banner
  cat <<EOF

Usage:
  ./run-helpps.sh                 Start HelpPS
  ./run-helpps.sh --port 3002     Start on a custom port
  ./run-helpps.sh --no-open       Start without opening a browser
  ./run-helpps.sh --logs          Show container logs
  ./run-helpps.sh --stop          Stop HelpPS
  ./run-helpps.sh --help          Show this help

Default URL:
  http://localhost:${default_port}

Prerequisite:
  Docker Desktop must be installed and running.
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        action="help"
        shift
        ;;
      --stop)
        action="stop"
        shift
        ;;
      --logs)
        action="logs"
        shift
        ;;
      --no-open)
        open_browser="no"
        shift
        ;;
      --port)
        [[ $# -ge 2 ]] || die "--port requires a number."
        app_port="$2"
        shift 2
        ;;
      --port=*)
        app_port="${1#*=}"
        shift
        ;;
      *)
        die "Unknown option: $1. Use --help."
        ;;
    esac
  done
}

validate_port() {
  local port="$1"
  [[ "$port" =~ ^[0-9]+$ ]] || die "Port must be a number."
  (( port >= 1024 && port <= 65535 )) || die "Port must be between 1024 and 65535."
}

detect_compose() {
  command -v docker >/dev/null 2>&1 || die "Docker is not installed. Install Docker Desktop, then run this again."
  docker info >/dev/null 2>&1 || die "Docker is installed but not running. Start Docker Desktop, then run this again."

  if docker compose version >/dev/null 2>&1; then
    compose_cmd=(docker compose -f "$compose_file" -p "$project_name")
  elif command -v docker-compose >/dev/null 2>&1; then
    compose_cmd=(docker-compose -f "$compose_file" -p "$project_name")
  else
    die "Docker Compose is not available. Update Docker Desktop or install docker-compose."
  fi
}

is_port_busy() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    nc -z 127.0.0.1 "$port" >/dev/null 2>&1
  fi
}

first_free_port() {
  local candidates=("$@")
  local port
  for port in "${candidates[@]}"; do
    if ! is_port_busy "$port"; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

choose_port() {
  local suggestions=("5174" "5175" "3000" "3001" "8080" "8081")

  if [[ -n "$app_port" ]]; then
    validate_port "$app_port"
    if is_port_busy "$app_port"; then
      die "Port $app_port is already in use. Try --port $(first_free_port "${suggestions[@]}" || echo 3002)."
    fi
    return
  fi

  app_port="$default_port"
  if ! is_port_busy "$app_port"; then
    return
  fi

  echo "Port $app_port is already in use."

  if [[ -t 0 ]]; then
    local free_options=()
    local port
    for port in "${suggestions[@]}"; do
      if ! is_port_busy "$port"; then
        free_options+=("$port")
      fi
    done

    [[ ${#free_options[@]} -gt 0 ]] || die "No suggested free ports found. Run again with --port <number>."

    echo "Choose a port:"
    local index=1
    for port in "${free_options[@]}"; do
      echo "  $index) $port"
      index=$((index + 1))
    done
    echo "  c) Custom"
    read -r -p "Selection [1]: " selection
    selection="${selection:-1}"

    if [[ "$selection" == "c" || "$selection" == "C" ]]; then
      read -r -p "Custom port: " app_port
      validate_port "$app_port"
      if is_port_busy "$app_port"; then
        die "Port $app_port is already in use."
      fi
    elif [[ "$selection" =~ ^[0-9]+$ ]] && (( selection >= 1 && selection <= ${#free_options[@]} )); then
      app_port="${free_options[$((selection - 1))]}"
    else
      die "Invalid selection."
    fi
  else
    app_port="$(first_free_port "${suggestions[@]}")" || die "Port $default_port is busy. Run again with --port <number>."
    echo "Using available port $app_port."
  fi
}

wait_for_ready() {
  local url="$1"
  local attempts=60
  local i

  printf "Waiting for HelpPS"
  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo
      return 0
    fi
    printf "."
    sleep 1
  done
  echo
  "${compose_cmd[@]}" logs --tail=80 web || true
  die "HelpPS did not respond at $url."
}

open_url() {
  local url="$1"
  if [[ "$open_browser" != "yes" ]]; then
    return
  fi

  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  else
    echo "Open this URL in your browser: $url"
  fi
}

start_app() {
  choose_port
  export APP_PORT="$app_port"
  local url="${APP_URL:-http://localhost:${APP_PORT}}"

  echo "Starting HelpPS on $url"
  "${compose_cmd[@]}" up --build -d
  wait_for_ready "$url"
  open_url "$url"

  cat <<EOF

HelpPS is running:
  $url

Useful commands:
  ./run-helpps.sh --logs
  ./run-helpps.sh --stop
EOF
}

parse_args "$@"

if [[ "$action" == "help" ]]; then
  usage
  exit 0
fi

banner
cd "$project_root"
detect_compose

case "$action" in
  start)
    start_app
    ;;
  stop)
    "${compose_cmd[@]}" down
    echo "HelpPS stopped."
    ;;
  logs)
    "${compose_cmd[@]}" logs --tail=120 -f
    ;;
esac
