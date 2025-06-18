-- CreateTable
CREATE TABLE "Passeio" (
    "id" BIGSERIAL NOT NULL,
    "guia_id" BIGINT NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao_curta" TEXT NOT NULL,
    "descricao_longa" TEXT NOT NULL,
    "preco" DECIMAL(65,30) NOT NULL,
    "duracao_horas" DECIMAL(65,30) NOT NULL,
    "dificuldade" "DificuldadePasseio" NOT NULL,
    "localizacao_geral" TEXT NOT NULL,
    "localizacao_detalhada" TEXT,
    "link_Maps" TEXT,
    "politica_cancelamento" "PoliticaCancelamento" NOT NULL,
    "status" "StatusPasseio" NOT NULL DEFAULT 'rascunho',
    "itens_inclusos" JSONB,
    "requisitos" TEXT,
    "imagem_principal_url" TEXT,
    "galeria_imagens_urls" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Passeio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasseioTag" (
    "passeio_id" BIGINT NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "PasseioTag_pkey" PRIMARY KEY ("passeio_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "Passeio" ADD CONSTRAINT "Passeio_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "PerfilDeGuia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passeio" ADD CONSTRAINT "Passeio_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasseioTag" ADD CONSTRAINT "PasseioTag_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasseioTag" ADD CONSTRAINT "PasseioTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
