/*
  Warnings:

  - The `tipo_de_usuario` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[cpf]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('cliente', 'guia', 'admin');

-- CreateEnum
CREATE TYPE "StatusVerificacao" AS ENUM ('pendente', 'verificado', 'rejeitado');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('RG_FRENTE', 'RG_VERSO', 'CNH_FRENTE', 'COMPROVANTE_RESIDENCIA', 'SELFIE_COM_DOC', 'CERTIFICADO_CURSO');

-- CreateEnum
CREATE TYPE "DificuldadePasseio" AS ENUM ('facil', 'moderado', 'dificil');

-- CreateEnum
CREATE TYPE "PoliticaCancelamento" AS ENUM ('flexivel', 'moderada', 'rigorosa', 'nao_reembolsavel');

-- CreateEnum
CREATE TYPE "StatusPasseio" AS ENUM ('ativo', 'rascunho', 'inativo', 'pendente_aprovacao', 'rejeitado');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('confirmada', 'pendente_pagamento', 'cancelada_pelo_usuario', 'cancelada_pelo_guia', 'concluida', 'nao_compareceu');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'aprovado', 'recusado', 'reembolsado', 'chargeback');

-- CreateEnum
CREATE TYPE "StatusRepasse" AS ENUM ('pendente', 'pago', 'agendado', 'falhou');

-- CreateEnum
CREATE TYPE "StatusAvaliacao" AS ENUM ('pendente_aprovacao', 'aprovada', 'rejeitada');

-- CreateEnum
CREATE TYPE "CategoriaCusto" AS ENUM ('MARKETING', 'OPERACAO', 'EQUIPAMENTO', 'TAXAS', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoConsentimento" AS ENUM ('TERMOS_DE_USO', 'POLITICA_DE_PRIVACIDADE', 'COMUNICACOES_MARKETING');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "endereco_bairro" TEXT,
ADD COLUMN     "endereco_cep" TEXT,
ADD COLUMN     "endereco_cidade" TEXT,
ADD COLUMN     "endereco_complemento" TEXT,
ADD COLUMN     "endereco_estado" TEXT,
ADD COLUMN     "endereco_logradouro" TEXT,
ADD COLUMN     "endereco_numero" TEXT,
DROP COLUMN "tipo_de_usuario",
ADD COLUMN     "tipo_de_usuario" "TipoUsuario" NOT NULL DEFAULT 'cliente';

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
