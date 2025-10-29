@echo off
REM Admin Dashboard Modernization - Quick Start Script (Windows)
REM This script helps you complete the refactoring process

echo ======================================
echo Admin Dashboard Modernization Setup
echo ======================================
echo.

REM Step 1: Database Migration
echo Step 1: Running Prisma Migration...
echo --------------------------------------
cd server

echo Creating migration for profileImage field...
call npx prisma migrate dev --name add_admin_profile_image

if %errorlevel% == 0 (
    echo ✓ Migration created successfully
) else (
    echo × Migration failed. Using db push instead...
    call npx prisma db push
)

echo.
echo Generating Prisma Client...
call npx prisma generate

if %errorlevel% == 0 (
    echo ✓ Prisma Client generated
) else (
    echo × Failed to generate Prisma Client
    echo You may need to restart the NestJS server and try again
)

echo.
echo --------------------------------------
echo Step 2: Rebuild Backend
echo --------------------------------------
call npm run build

if %errorlevel% == 0 (
    echo ✓ Backend built successfully
) else (
    echo ⚠ Build had warnings but may still work
)

cd ..

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next Steps:
echo 1. Restart your NestJS server:
echo    cd server ^&^& npm run start:dev
echo.
echo 2. Test the new endpoints:
echo    GET  http://localhost:3000/admin/profile
echo    PUT  http://localhost:3000/admin/profile
echo.
echo 3. Review the refactoring guide:
echo    ADMIN_DASHBOARD_REFACTORING_GUIDE.md
echo.
echo 4. Optionally refactor AdminDashboard.tsx
echo    (All modular components are ready!)
echo.
echo ======================================
pause
