// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================
// Este arquivo esta quase vazio DE PROPOSITO.
// Hoje voce vai escrever as rotas, uma de cada vez, conferindo
// no testes.http se cada uma responde o status certo.
// O que cada rota deve fazer esta no README.md.
// ============================================================

const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();

// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());
const db = new DatabaseSync('treinos.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        duracao INTEGER NOT NULL
    )
`);

// ------------------------------------------------------------
// Os dados moram aqui, na memoria. Somem quando o servidor cai.
// (Na Aula 03 isso vira banco de dados.)
// ------------------------------------------------------------


// ------------------------------------------------------------
// Validacao
// Escreva a funcao validarTreino(corpo), que devolve a mensagem
// de erro quando algo esta errado, ou null quando esta tudo certo.
// ------------------------------------------------------------



// ------------------------------------------------------------
// GET /treinos - lista todos os treinos
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    const { minimo, busca } = req.query;

    let sql = 'SELECT * FROM treinos WHERE 1=1';
    const parametros = [];

    if (minimo) {
        sql += ' AND duracao >= ?';
        parametros.push(Number(minimo));
    }

    if (busca) {
        sql += ' AND nome LIKE ?';
        parametros.push(`%${busca}%`);
    }

    sql += ' ORDER BY duracao ASC';

    const treinos = db.prepare(sql).all(...parametros);
    res.json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id (404 se nao existir)
// ------------------------------------------------------------
app.get('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID inválido' });
}
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (!treino) {
    return res.status(404).json({ erro: 'Treino não encontrado' });
}
res.json(treino);
});
app.get('/treinos/total', (req, res) => {
    const resultado = db.prepare('SELECT COUNT(*) AS total FROM treinos').get();
    res.json(resultado);
});
app.get('/treinos/resumo', (req, res) => {
    const resumo = db.prepare(`
        SELECT
            COUNT(*) AS total,
            SUM(duracao) AS duracaoTotal,
            AVG(duracao) AS duracaoMedia
        FROM treinos
    `).get();

    res.json(resumo);
});


// ------------------------------------------------------------
// POST /treinos - cria um treino (400 se os dados forem invalidos)
// ------------------------------------------------------------
app.post('/treinos', (req, res) => {
    const { nome, duracao } = req.body;
    if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: 'Nome inválido' });
}
if (!Number.isInteger(duracao) || duracao <= 0) {
    return res.status(400).json({ erro: 'Duração inválida' });
}
const resultado = db.prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)').run(nome.trim(), duracao);
const novoId = Number(resultado.lastInsertRowid);
const novoTreino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(novoId);
res.status(201).json(novoTreino);
});


// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino
// ------------------------------------------------------------
app.put('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID inválido' });
}
const { nome, duracao } = req.body;
if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: 'Nome inválido' });
}
if (!Number.isInteger(duracao) || duracao <= 0) {
    return res.status(400).json({ erro: 'Duração inválida' });
}
const resultado = db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?').run(nome.trim(), duracao, id);
if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Treino não encontrado' });
}
const treinoAtualizado = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
res.json(treinoAtualizado);
});


// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
// ------------------------------------------------------------
app.delete('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido' });
    }

    const resultado = db.prepare('DELETE FROM treinos WHERE id = ?').run(id);

    if (resultado.changes === 0) {
        return res.status(404).json({ erro: 'Treino não encontrado' });
    }

    res.status(204).send();
});


// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
