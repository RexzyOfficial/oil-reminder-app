#!/bin/bash

echo "🧪 Testing PWA OliReminder..."

# Build project
echo "🔨 Building project..."
npm run build

# Check if build successful
if [ $? -eq 0 ]; then
    echo "✅ Build berhasil!"
    echo ""
    echo "📱 Untuk test PWA:"
    echo "1. Jalankan: npx serve dist -s"
    echo "2. Buka http://localhost:3000 di browser"
    echo "3. Di Chrome DevTools, buka tab 'Application'"
    echo "4. Cek: Manifest, Service Workers, Installability"
    echo ""
    echo "📲 Untuk install di HP:"
    echo "1. Deploy ke hosting (Netlify/Vercel/Firebase)"
    echo "2. Buka di browser mobile"
    echo "3. Pilih 'Add to Home Screen'"
else
    echo "❌ Build gagal!"
    exit 1
fi
