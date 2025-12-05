#!/bin/bash

# Script para clonar projeto para novo repositório GitHub
# Uso: ./clonar-repositorio.sh SEU_USUARIO_GITHUB

if [ -z "$1" ]; then
    echo "❌ Erro: Você precisa fornecer seu username do GitHub"
    echo "Uso: ./clonar-repositorio.sh SEU_USUARIO_GITHUB"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME="MNNOSCHOOL"

echo "🚀 Configurando novo repositório remoto..."
echo "   Repositório: $GITHUB_USER/$REPO_NAME"
echo ""

# Verificar se já existe um remote origin
if git remote | grep -q "^origin$"; then
    echo "📦 Removendo remote 'origin' atual..."
    git remote remove origin
fi

# Adicionar novo remote
echo "➕ Adicionando novo remote..."
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Verificar remote
echo ""
echo "✅ Remote configurado:"
git remote -v

echo ""
echo "📝 Próximos passos:"
echo "1. Certifique-se de que o repositório '$REPO_NAME' foi criado no GitHub"
echo "2. Execute: git push -u origin main"
echo ""
echo "⚠️  IMPORTANTE: Crie o repositório no GitHub antes de fazer o push!"


