#!/bin/bash

set -e

SHEIKH_VERSION="1.0.0"
INSTALL_DIR="$HOME/.sheikh"
BIN_DIR="$HOME/.local/bin"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    local missing=()
    
    if ! command -v node &> /dev/null; then
        missing+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing[*]}"
        echo "Please install the required dependencies first."
        exit 1
    fi
}

check_termux() {
    if [ -d "/data/data/com.termux" ]; then
        log_info "Detected Termux environment"
        TERMUX=true
    else
        TERMUX=false
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    if command -v pkg &> /dev/null; then
        pkg update && pkg upgrade -y
        pkg install -y git nodejs
    fi
}

clone_or_download() {
    log_info "Installing Sheikh CLI v${SHEIKH_VERSION}..."
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    if [ -d ".git" ]; then
        log_info "Updating existing installation..."
        git pull
    else
        log_info "Cloning repository..."
        REPO_URL="${REPO_URL:-https://github.com/anomalyco/sheikh-cli}"
        git clone "$REPO_URL" .
    fi
    
    npm install
    
    if [ -d "dist" ]; then
        npm run build
    fi
}

create_bin_link() {
    mkdir -p "$BIN_DIR"
    
    if [ -f "$INSTALL_DIR/dist/index.js" ]; then
        echo '#!/bin/bash
node "'"$INSTALL_DIR"'/dist/index.js" "$@"' > "$BIN_DIR/sheikh"
        chmod +x "$BIN_DIR/sheikh"
    fi
    
    if [ -f "$INSTALL_DIR/sheikh.sh" ]; then
        cp "$INSTALL_DIR/sheikh.sh" "$BIN_DIR/sheikh"
        chmod +x "$BIN_DIR/sheikh"
    fi
    
    log_success "Installed to $BIN_DIR/sheikh"
}

setup_bash_completion() {
    local bashrc="$HOME/.bashrc"
    local completion_line='eval "$(sheikh --completion bash)"'
    
    if ! grep -q "sheikh.*completion" "$bashrc" 2>/dev/null; then
        echo "" >> "$bashrc"
        echo "# Sheikh CLI completion" >> "$bashrc"
        echo "$completion_line" >> "$bashrc"
        log_info "Added bash completion to ~/.bashrc"
    fi
}

setup_zsh_completion() {
    local zshrc="$HOME/.zshrc"
    local comp_file="$HOME/.zsh/completions/_sheikh"
    
    if [ -f "$zshrc" ] && [ ! -f "$comp_file" ]; then
        mkdir -p "$(dirname "$comp_file")"
        # Generate completion would go here
        log_info "Zsh completion support added"
    fi
}

configure_termux() {
    if [ "$TERMUX" = true ]; then
        log_info "Configuring for Termux..."
        
        mkdir -p "$HOME/.termux"
        
        if [ ! -f "$HOME/.termux/termux.properties" ]; then
            cat > "$HOME/.termux/termux.properties" << 'EOF'
extra-keys = [['ESC','TAB','CTRL','ALT','{','}','$','|']]
EOF
            log_info "Added extra keys configuration"
        fi
        
        if ! grep -q "sheikh" "$HOME/.bashrc" 2>/dev/null; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        fi
    fi
}

create_uninstall_script() {
    cat > "$INSTALL_DIR/uninstall.sh" << UNINSTALL_EOF
#!/bin/bash
rm -rf "$INSTALL_DIR"
rm -f "$BIN_DIR/sheikh"
echo "Sheikh CLI uninstalled"
UNINSTALL_EOF
    chmod +x "$INSTALL_DIR/uninstall.sh"
}

print_summary() {
    echo ""
    echo "=============================================="
    log_success "Sheikh CLI installed successfully!"
    echo "=============================================="
    echo ""
    echo "Quick start:"
    echo "  sheikh                    # Start interactive mode"
    echo "  sheikh --help            # Show help"
    echo "  sheikh init my-project   # Create new project"
    echo ""
    echo "Documentation: https://sheikh-cli.dev/docs"
    echo ""
}

main() {
    echo "=============================================="
    echo "  Sheikh CLI Installer v${SHEIKH_VERSION}"
    echo "=============================================="
    echo ""
    
    check_dependencies
    check_termux
    install_dependencies
    clone_or_download
    create_bin_link
    setup_bash_completion
    configure_termux
    create_uninstall_script
    print_summary
}

main "$@"
