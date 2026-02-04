#!/bin/bash

# Start both frontend and backend servers together

echo "🚀 Starting Findhåndværkeren Development Servers"
echo ""

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
  echo "⚠️  Backend dependencies not installed. Installing..."
  cd backend && npm install && cd ..
fi

# Check if frontend node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  Frontend dependencies not installed. Installing..."
  npm install
fi

echo "✅ Starting servers..."
echo ""
echo "📡 Backend: http://localhost:4000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
cd backend && npm run dev &
BACKEND_PID=$!

cd "$(dirname "$0")" && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

