-- CreateTable
CREATE TABLE "PerfilDeGuia" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "nome_publico" TEXT NOT NULL,
    "tagline" TEXT,
    "bio_publica" TEXT,
    "numero_cadastur" TEXT,
    "status_verificacao" "StatusVerificacao" NOT NULL DEFAULT 'pendente',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilDeGuia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerfilDeGuia_usuario_id_key" ON "PerfilDeGuia"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilDeGuia_numero_cadastur_key" ON "PerfilDeGuia"("numero_cadastur");

-- AddForeignKey
ALTER TABLE "PerfilDeGuia" ADD CONSTRAINT "PerfilDeGuia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
