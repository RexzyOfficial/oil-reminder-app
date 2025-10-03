#!/bin/bash

echo "🚀 PUSH TO GITHUB - OliReminder"
echo "================================"

# Config
GITHUB_USERNAME="RexzyOfficial"
GITHUB_EMAIL="rexzyofc@gmail.com"
REPO_NAME="oil-reminder-app"
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${YELLOW}📌 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check if Git is installed
print_status "1. Checking Git installation..."
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git first: pkg install git"
    exit 1
fi
print_success "Git is installed"

# Step 2: Check if in Git repository
print_status "2. Checking Git repository..."
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi
print_success "Git repository ready"

# Step 3: Set Git config
print_status "3. Setting Git configuration..."
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"
print_success "Git config set: $GITHUB_USERNAME <$GITHUB_EMAIL>"

# Step 4: Create .gitignore if not exists
print_status "4. Checking .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
    print_success ".gitignore created"
else
    print_success ".gitignore already exists"
fi

# Step 5: Add all files to Git
print_status "5. Adding files to Git..."
git add .
print_success "All files added to staging"

# Step 6: Commit changes
print_status "6. Committing changes..."
git commit -m "Deploy OliReminder PWA

- Complete PWA with service worker
- Mobile responsive design
- Oli tracking for mesin & gardan
- Local storage support
- Indonesian language interface
- Vite + React + TypeScript

Deployed: $(date +'%Y-%m-%d %H:%M:%S')"

print_success "Changes committed"

# Step 7: Set remote origin
print_status "7. Setting remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$GITHUB_URL"
print_success "Remote set to: $GITHUB_URL"

# Step 8: Push to GitHub
print_status "8. Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    print_success "🎉 SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "🌐 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📱 Next steps for Vercel deployment:"
    echo "   1. Go to: https://vercel.com/new"
    echo "   2. Import from GitHub: $GITHUB_URL"
    echo "   3. Click 'Deploy'"
    echo ""
    echo "🚀 Your app will be live at: https://oil-reminder-app.vercel.app"
else
    print_error "Failed to push to GitHub!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Check internet connection"
    echo "   - Verify repository exists: $GITHUB_URL"
    echo "   - Check GitHub credentials"
    echo "   - Make sure repository is empty (no README.md etc.)"
    exit 1
fi

# Step 9: Show project status
print_status "9. Project status:"
echo ""
echo "📁 Project structure:"
echo "   ├── public/"
echo "   │   ├── icons/          # PWA icons"
echo "   │   ├── manifest.json   # PWA config"
echo "   │   └── sw.js          # Service Worker"
echo "   ├── src/"
echo "   │   └── App.tsx        # Main application"
echo "   ├── package.json       # Dependencies"
echo "   └── vite.config.ts     # Build config"
echo ""
echo "📊 Git status:"
git status --short
echo ""
print_success "✅ All done! Your OliReminder is on GitHub! 🎉"
