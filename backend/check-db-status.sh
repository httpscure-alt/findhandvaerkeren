#!/bin/bash

# Quick script to check database connectivity

echo "🔍 Checking Supabase Database Status..."
echo ""

# Test DNS resolution
echo "1. Testing DNS resolution..."
if nslookup db.cxtahzminxrnujysbvtz.supabase.co > /dev/null 2>&1; then
    echo "   ✅ Hostname resolves"
else
    echo "   ❌ Hostname does NOT resolve"
    echo "   ⚠️  This usually means the database is PAUSED"
    echo "   → Go to https://app.supabase.com and RESTORE your project"
    exit 1
fi

echo ""
echo "2. Testing port 5432 (direct connection)..."
if nc -z -v db.cxtahzminxrnujysbvtz.supabase.co 5432 2>&1 | grep -q "succeeded"; then
    echo "   ✅ Port 5432 is open"
else
    echo "   ❌ Port 5432 is closed or unreachable"
fi

echo ""
echo "3. Testing port 6543 (connection pooler)..."
if nc -z -v db.cxtahzminxrnujysbvtz.supabase.co 6543 2>&1 | grep -q "succeeded"; then
    echo "   ✅ Port 6543 is open"
else
    echo "   ❌ Port 6543 is closed or unreachable"
fi

echo ""
echo "📝 Next Steps:"
echo "   1. If hostname doesn't resolve → Activate database in Supabase dashboard"
echo "   2. If ports are closed → Database is paused, restore it"
echo "   3. If ports are open → Try: npm run test:connection"
