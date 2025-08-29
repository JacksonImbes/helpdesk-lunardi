const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');

// IMPORTANTE: Cole aqui a sua Connection String da Supabase
const connectionString = 'postgresql://postgres.gcjezsabqkofkcogspje:Lun%40t1%232025@aws-1-sa-east-1.pooler.supabase.com:5432/postgres';

// Configuração do banco de origem (SQLite)
const dbSqlite = new sqlite3.Database('./backend/dev.sqlite3', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("Erro ao conectar ao SQLite:", err.message);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Configuração do banco de destino (PostgreSQL)
const clientPg = new Client({ connectionString });

// Função genérica para migrar uma tabela
async function migrarTabela(nomeTabela, colunas) {
    console.log(`\n--- Iniciando migração da tabela: ${nomeTabela} ---`);
    try {
        const queryLeitura = `SELECT * FROM ${nomeTabela}`;
        const rows = await new Promise((resolve, reject) => {
            dbSqlite.all(queryLeitura, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (rows.length === 0) {
            console.log(`Tabela ${nomeTabela} está vazia. Nenhuma migração necessária.`);
            return;
        }

        console.log(`Encontrados ${rows.length} registros em ${nomeTabela}. Inserindo no PostgreSQL...`);

        for (const row of rows) {
            const colunasNomes = colunas.join(', ');
            const valoresPlaceholder = colunas.map((_, i) => `$${i + 1}`).join(', ');
            const valores = colunas.map(col => row[col]);

            const queryInsercao = `INSERT INTO ${nomeTabela} (${colunasNomes}) VALUES (${valoresPlaceholder})`;
            await clientPg.query(queryInsercao, valores);
        }
        console.log(`>>> Migração da tabela ${nomeTabela} concluída com sucesso!`);
    } catch (err) {
        console.error(`ERRO ao migrar a tabela ${nomeTabela}:`, err.message);
    }
}

async function main() {
    try {
        await clientPg.connect();
        console.log('Conectado ao banco de dados PostgreSQL na Supabase!');

        // Migração em ordem de dependência (primeiro usuários, depois os outros)
        await migrarTabela('users', [
            'id', 'name', 'email', 'password', 'role', 'cpf', 'phone', 
            'admission_date', 'position', 'department', 'status'
        ]);
        
        await migrarTabela('inventory_items', [
            'id', 'name', 'type', 'serial_number', 'description', 'purchase_date', 
            'status', 'assigned_to_id'
        ]);

        await migrarTabela('chamados', [
            'id', 'title', 'description', 'status', 'created_at', 'priority', 
            'closed_at', 'user_id', 'assigned_to_id'
        ]);
        
        await migrarTabela('comments', [
            'id', 'content', 'created_at', 'chamado_id', 'user_id'
        ]);

    } catch (err) {
        console.error('ERRO GERAL DURANTE A MIGRAÇÃO:', err);
    } finally {
        dbSqlite.close();
        await clientPg.end();
        console.log('\nConexões com os bancos de dados fechadas.');
    }
}

// Inicia o processo
main();