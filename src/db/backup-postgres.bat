@echo off
REM =============================================
REM SCRIPT DE BACKUP - PostgreSQL (Supabase)
REM Schema: public
REM =============================================

REM Adicionar PostgreSQL ao PATH (ajuste se necessario)
set PATH=C:\Program Files\PostgreSQL\18\bin;%PATH%

REM Configuracoes do Supabase (projeto atual)
set DB_HOST=aws-0-us-west-2.pooler.supabase.com
set DB_PORT=6543
set DB_NAME=postgres
set DB_USER=postgres.ebaypdptyhbyqduovvce
set DB_SCHEMA=public
set BACKUP_DIR=.
set PGPASSWORD=

if "%PGPASSWORD%"=="" (
    echo Defina a senha em PGPASSWORD antes de executar este script.
    echo Exemplo: set PGPASSWORD=seu_password
    pause
    exit /b 1
)

REM Criar timestamp para o arquivo
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

REM Criar diretorio de backup se nao existir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo ========================================
echo BACKUP DO SCHEMA PUBLIC (PostgreSQL)
echo ========================================
echo Timestamp: %TIMESTAMP%
echo Schema: %DB_SCHEMA%
echo Host: %DB_HOST%
echo Diretorio: %BACKUP_DIR%
echo ========================================
echo.

REM 1. Backup completo (estrutura + dados)
echo [1/3] Gerando backup completo...
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -n %DB_SCHEMA% -F p -b -v -f "%BACKUP_DIR%\supabase_public_full_%TIMESTAMP%.sql"

if %errorlevel% neq 0 (
    echo ERRO ao criar backup completo.
    pause
    exit /b 1
)

echo.
REM 2. Backup apenas estrutura
echo [2/3] Gerando backup da estrutura...
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -n %DB_SCHEMA% -F p -s -v -f "%BACKUP_DIR%\supabase_public_structure_%TIMESTAMP%.sql"

if %errorlevel% neq 0 (
    echo ERRO ao criar backup da estrutura.
    pause
    exit /b 1
)

echo.
REM 3. Backup apenas dados
echo [3/3] Gerando backup dos dados...
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -n %DB_SCHEMA% -F p -a -v -f "%BACKUP_DIR%\supabase_public_data_%TIMESTAMP%.sql"

if %errorlevel% neq 0 (
    echo ERRO ao criar backup dos dados.
    pause
    exit /b 1
)

echo.
echo ========================================
echo BACKUP CONCLUIDO COM SUCESSO
echo ========================================
echo Arquivos gerados:
echo  - supabase_public_full_%TIMESTAMP%.sql
echo  - supabase_public_structure_%TIMESTAMP%.sql
echo  - supabase_public_data_%TIMESTAMP%.sql
echo ========================================
pause