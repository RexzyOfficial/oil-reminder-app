#!/bin/bash

echo "📁 Copy icon dari PWABuilder ke project..."

# Check if source directory exists
SOURCE_DIR="/storage/emulated/0/abicon/android"
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Folder Download tidak ditemukan: $SOURCE_DIR"
    echo "💡 Silakan sesuaikan path folder download Anda"
    exit 1
fi

# Copy and rename icons
echo "📤 Copy dan rename icon..."

# Copy dengan pattern matching
cp "$SOURCE_DIR"/android-launchericon-48-48.png public/icons/icon-48x48.png 2>/dev/null || echo "⚠️  Icon 48x48 tidak ditemukan, skip"
cp "$SOURCE_DIR"/android-launchericon-72-72.png public/icons/icon-72x72.png 2>/dev/null || echo "⚠️  Icon 72x72 tidak ditemukan, skip"
cp "$SOURCE_DIR"/android-launchericon-96-96.png public/icons/icon-96x96.png 2>/dev/null || echo "⚠️  Icon 96x96 tidak ditemukan, skip"
cp "$SOURCE_DIR"/android-launchericon-144-144.png public/icons/icon-144x144.png 2>/dev/null || echo "⚠️  Icon 144x144 tidak ditemukan, skip"
cp "$SOURCE_DIR"/android-launchericon-192-192.png public/icons/icon-192x192.png 2>/dev/null || echo "⚠️  Icon 192x192 tidak ditemukan, skip"
cp "$SOURCE_DIR"/android-launchericon-512-512.png public/icons/icon-512x512.png 2>/dev/null || echo "⚠️  Icon 512x512 tidak ditemukan, skip"

# Create missing icons from 512x512 (optional)
if [ -f "public/icons/icon-512x512.png" ]; then
    echo "🔧 Generate icon ukuran lain dari 512x512..."
    # You can add image conversion commands here if needed
fi

echo "✅ Copy icon selesai!"
echo "📁 Icon yang berhasil di-copy:"
ls -la public/icons/
