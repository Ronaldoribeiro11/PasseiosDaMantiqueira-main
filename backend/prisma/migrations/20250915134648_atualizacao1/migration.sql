-- CreateTable
CREATE TABLE "Dependente" (
    "id" BIGSERIAL NOT NULL,
    "responsavel_usuario_id" BIGINT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "documento_identidade" TEXT,
    "observacoes_medicas" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dependente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" BIGSERIAL NOT NULL,
    "perfil_de_guia_id" BIGINT NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL,
    "url_arquivo" TEXT NOT NULL,
    "status_verificacao" "StatusVerificacao" NOT NULL DEFAULT 'pendente',
    "observacoes_admin" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDisponivel" (
    "id" BIGSERIAL NOT NULL,
    "passeio_id" BIGINT NOT NULL,
    "data_hora_inicio" TIMESTAMP(3) NOT NULL,
    "vagas_maximas" INTEGER NOT NULL,
    "vagas_ocupadas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DataDisponivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" BIGSERIAL NOT NULL,
    "codigo_reserva" TEXT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "passeio_id" BIGINT NOT NULL,
    "data_disponivel_id" BIGINT NOT NULL,
    "valor_total" DECIMAL(65,30) NOT NULL,
    "status_reserva" "StatusReserva" NOT NULL DEFAULT 'pendente_pagamento',
    "observacoes_cliente" TEXT,
    "data_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaParticipante" (
    "id" BIGSERIAL NOT NULL,
    "reserva_id" BIGINT NOT NULL,
    "usuario_id" BIGINT,
    "dependente_id" BIGINT,

    CONSTRAINT "ReservaParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" BIGSERIAL NOT NULL,
    "reserva_id" BIGINT NOT NULL,
    "gateway_nome" TEXT NOT NULL,
    "gateway_transacao_id" TEXT NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'pendente',
    "valor" DECIMAL(65,30) NOT NULL,
    "metodo_pagamento" TEXT,
    "dados_pagamento" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repasse" (
    "id" BIGSERIAL NOT NULL,
    "pagamento_id" BIGINT NOT NULL,
    "reserva_id" BIGINT NOT NULL,
    "guia_id" BIGINT NOT NULL,
    "valor_bruto_transacao" DECIMAL(65,30) NOT NULL,
    "percentual_comissao_aplicado" DECIMAL(65,30) NOT NULL,
    "valor_comissao_sistema" DECIMAL(65,30) NOT NULL,
    "valor_liquido_guia" DECIMAL(65,30) NOT NULL,
    "status_repasse" "StatusRepasse" NOT NULL DEFAULT 'pendente',
    "data_prevista_repasse" TIMESTAMP(3),
    "data_efetiva_repasse" TIMESTAMP(3),
    "gateway_repasse_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "passeio_id" BIGINT NOT NULL,
    "reserva_id" BIGINT,
    "nota" INTEGER NOT NULL,
    "titulo" TEXT,
    "comentario" TEXT,
    "resposta_do_guia" TEXT,
    "status" "StatusAvaliacao" NOT NULL DEFAULT 'pendente_aprovacao',
    "data_avaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_resposta" TIMESTAMP(3),

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "usuario_id" BIGINT NOT NULL,
    "passeio_id" BIGINT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("usuario_id","passeio_id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" BIGSERIAL NOT NULL,
    "passeio_id" BIGINT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversaParticipante" (
    "conversa_id" BIGINT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "data_ultima_leitura" TIMESTAMP(3),

    CONSTRAINT "ConversaParticipante_pkey" PRIMARY KEY ("conversa_id","usuario_id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" BIGSERIAL NOT NULL,
    "conversa_id" BIGINT NOT NULL,
    "remetente_id" BIGINT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "destinatario_id" BIGINT NOT NULL,
    "tipo_notificacao" TEXT,
    "mensagem" TEXT NOT NULL,
    "link_url" TEXT,
    "data_leitura" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoOperacional" (
    "id" BIGSERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "categoria" "CategoriaCusto" NOT NULL,
    "data_custo" TIMESTAMP(3) NOT NULL,
    "comprovante_url" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustoOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "ConsentimentoUsuario" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "tipo_consentimento" "TipoConsentimento" NOT NULL,
    "versao" TEXT,
    "status" BOOLEAN NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentimentoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoAlteracao" (
    "id" BIGSERIAL NOT NULL,
    "usuario_modificador_id" BIGINT,
    "tabela_modificada" TEXT NOT NULL,
    "registro_id" BIGINT NOT NULL,
    "valor_antigo" TEXT,
    "valor_novo" TEXT,
    "data_modificacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAlteracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataDisponivel_passeio_id_data_hora_inicio_key" ON "DataDisponivel"("passeio_id", "data_hora_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_codigo_reserva_key" ON "Reserva"("codigo_reserva");

-- CreateIndex
CREATE INDEX "ReservaParticipante_usuario_id_idx" ON "ReservaParticipante"("usuario_id");

-- CreateIndex
CREATE INDEX "ReservaParticipante_dependente_id_idx" ON "ReservaParticipante"("dependente_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_reserva_id_key" ON "Pagamento"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_gateway_transacao_id_key" ON "Pagamento"("gateway_transacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "Repasse_pagamento_id_key" ON "Repasse"("pagamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_reserva_id_key" ON "Avaliacao"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversa_passeio_id_key" ON "Conversa"("passeio_id");

-- CreateIndex
CREATE INDEX "Notificacao_destinatario_id_data_leitura_idx" ON "Notificacao"("destinatario_id", "data_leitura");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_email_key" ON "PasswordReset"("email");

-- AddForeignKey
ALTER TABLE "Dependente" ADD CONSTRAINT "Dependente_responsavel_usuario_id_fkey" FOREIGN KEY ("responsavel_usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_perfil_de_guia_id_fkey" FOREIGN KEY ("perfil_de_guia_id") REFERENCES "PerfilDeGuia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataDisponivel" ADD CONSTRAINT "DataDisponivel_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_data_disponivel_id_fkey" FOREIGN KEY ("data_disponivel_id") REFERENCES "DataDisponivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaParticipante" ADD CONSTRAINT "ReservaParticipante_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaParticipante" ADD CONSTRAINT "ReservaParticipante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaParticipante" ADD CONSTRAINT "ReservaParticipante_dependente_id_fkey" FOREIGN KEY ("dependente_id") REFERENCES "Dependente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repasse" ADD CONSTRAINT "Repasse_pagamento_id_fkey" FOREIGN KEY ("pagamento_id") REFERENCES "Pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repasse" ADD CONSTRAINT "Repasse_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repasse" ADD CONSTRAINT "Repasse_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "PerfilDeGuia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_passeio_id_fkey" FOREIGN KEY ("passeio_id") REFERENCES "Passeio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversaParticipante" ADD CONSTRAINT "ConversaParticipante_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "Conversa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversaParticipante" ADD CONSTRAINT "ConversaParticipante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "Conversa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_remetente_id_fkey" FOREIGN KEY ("remetente_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_email_fkey" FOREIGN KEY ("email") REFERENCES "Usuario"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoUsuario" ADD CONSTRAINT "ConsentimentoUsuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAlteracao" ADD CONSTRAINT "HistoricoAlteracao_usuario_modificador_id_fkey" FOREIGN KEY ("usuario_modificador_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
