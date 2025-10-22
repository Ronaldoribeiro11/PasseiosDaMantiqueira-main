/*
  Warnings:

  - A unique constraint covering the columns `[titulo]` on the table `Passeio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Passeio_titulo_key" ON "Passeio"("titulo");
