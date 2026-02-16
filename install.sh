#!/bin/bash

set -e

SHEIKH_VERSION="1.0.0"
REPO_URL="https://github.com/osamabinlikhon/sheikh-cli"
INSTALL_DIR="$HOME/.sheikh"
BIN_DIR="$HOME/.local/bin"
NPM_PACKAGE="sheikh-termux"

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

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --npm          Install via npm (recommended)"
    echo "  --git          Install from GitHub source"
    echo "  --update       Update existing installation"
    echo "  -h, --help     Show this help message"
    echo ""
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

install_via_npm() {
    log_info "Installing sheikh-termux via npm..."
    npm install -g "$NPM_PACKAGE"
    log_success "Installed sheikh-termux globally!"
}

install_via_git() {
    log_info "Installing Sheikh CLI v${SHEIKH_VERSION} from GitHub..."
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    if [ -d ".git" ]; then
        log_info "Updating existing installation..."
        git pull
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" .
    fi
    
    npm install
    
    if [ -f "package.json" ]; then
        npm run build 2>/dev/null || true
    fi
    
    create_bin_link
}

update_installation() {
    if command -v sheikh &> /dev/null; then
        log_info "Updating sheikh-termux..."
        npm install -g "$NPM_PACKAGE"
        log_success "Updated sheikh-termux!"
    else
        log_warn "sheikh not found, installing fresh..."
        install_via_npm
    fi
}

create_bin_link() {
    mkdir -p "$BIN_DIR"
    
    if [ -f "$INSTALL_DIR/dist/index.js" ]; then
        echo '#!/bin/bash
node "'"$INSTALL_DIR"'/dist/index.js" "$@"' > "$BIN_DIR/sheikh"
        chmod +x "$BIN_DIR/sheikh"
    fi
    
    log_success "Installed to $BIN_DIR/she_bash_completion() {
    localikh"
}

setup bashrc="$HOME/.bashrc"
    local completion_line='eval "$(sheikh --completion bash 2>/dev/null)"'
    
    if [ -f "$bashrc" ] && ! grep -q "sheikh.*completion" "$bashrc" 2>/dev/null; then
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
        
        if ! grep -q "sheikh\|.local/bin" "$HOME/.bashrc" 2>/dev/null; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        fi
    fi
}

create_uninstall_script() {
    cat > "$INSTALL_DIR/uninstall.sh" << UNINSTALL_EOF
#!/bin/bash
rm -rf "$INSTALL_DIR"
rm -f "$BIN_DIR/sheikh"
npm uninstall -g $NPM_PACKAGE
echo "Sheikh CLI uninstalled"
UNINSTALL_EOF
    chmod +x "$INSTALL_DIR/uninstall.sh" 2>/dev/null || true
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
    echo "GitHub: $REPO_URL"
    echo "npm: https://npmjs.com/package/$NPM_PACKAGE"
    echo ""
}

main() {
    local install_method="npm"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --npm)
                install_method="npm"
                shift
                ;;
            --git)
                install_method="git"
                shift
                ;;
            --update)
                update_installation
                exit 0
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    echo "=============================================="
    echo "  Sheikh CLI Installer v${SHEIKH_VERSION}"
    echo "=============================================="
    echo ""
    
    check_dependencies
    check_termux
    
    if [ "$install_method" = "npm" ]; then
        install_via_npm
    else
        install_via_git
    fi
    
    setup_bash_completion
    configure_termux
    print_summary
}

main "$@"
