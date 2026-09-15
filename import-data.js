//THIS FILES IS SOLEY FOR IMPORTING SEPARATE TABLES INTO DATABASE FROM EXCEL SPREADSHEET

const XLSX = require("xlsx");
const Database = require("better-sqlite3");

const workbook = XLSX.readFile(
    "./data/automotive_tam_sql_practice_dataset.xlsx"
);

const db = new Database("automotive.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS Accounts (
        account_id TEXT PRIMARY KEY,
        account_name TEXT,
        account_type TEXT,
        region TEXT,
        integration_type TEXT,
        go_live_date TEXT,
        tam_owner TEXT,
        sla_tier TEXT,
        status TEXT
    )
`);

const accountsSheet = workbook.Sheets["Accounts"];

const accounts = XLSX.utils.sheet_to_json(accountsSheet);

const insertAccount = db.prepare(`
    INSERT OR REPLACE INTO Accounts (
        account_id,
        account_name,
        account_type,
        region,
        integration_type,
        go_live_date,
        tam_owner,
        sla_tier,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const account of accounts) {
    insertAccount.run(
        account.account_id,
        account.account_name,
        account.account_type,
        account.region,
        account.integration_type,
        account.go_live_date,
        account.tam_owner,
        account.sla_tier,
        account.status
    );
}

console.log("Accounts imported successfully.");


db.exec(`
    CREATE TABLE IF NOT EXISTS API_Requests (
        api_request_id TEXT PRIMARY KEY,
        account_id TEXT,
        request_timestamp TEXT,
        endpoint TEXT,
        http_method TEXT,
        status_code INTEGER,
        latency_ms INTEGER,
        records_processed INTEGER,
        error_code TEXT,
        correlation_id TEXT,
        environment TEXT
    )
`);

const apiSheet = workbook.Sheets["API_Requests"];
const apiRequests = XLSX.utils.sheet_to_json(apiSheet);

const insertApiRequest = db.prepare(`
    INSERT OR REPLACE INTO API_Requests (
        api_request_id,
        account_id,
        request_timestamp,
        endpoint,
        http_method,
        status_code,
        latency_ms,
        records_processed,
        error_code,
        correlation_id,
        environment
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const request of apiRequests) {
    insertApiRequest.run(
        request.api_request_id,
        request.account_id,
        request.request_timestamp,
        request.endpoint,
        request.http_method,
        request.status_code,
        request.latency_ms,
        request.records_processed,
        request.error_code || null,
        request.correlation_id,
        request.environment
    );
}

console.log("API requests imported successfully.");

db.exec(`
    CREATE TABLE IF NOT EXISTS Support_Tickets (
        ticket_id TEXT PRIMARY KEY,
        account_id TEXT,
        opened_at TEXT,
        priority TEXT,
        category TEXT,
        subject TEXT,
        status TEXT,
        first_response_minutes INTEGER,
        resolution_hours REAL,
        root_cause TEXT,
        customer_impact TEXT
    )
`);

const ticketsSheet = workbook.Sheets["Support_Tickets"];
const tickets = XLSX.utils.sheet_to_json(ticketsSheet);

const insertTicket = db.prepare(`
    INSERT OR REPLACE INTO Support_Tickets (
        ticket_id,
        account_id,
        opened_at,
        priority,
        category,
        subject,
        status,
        first_response_minutes,
        resolution_hours,
        root_cause,
        customer_impact
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const ticket of tickets) {
    insertTicket.run(
        ticket.ticket_id,
        ticket.account_id,
        ticket.opened_at,
        ticket.priority,
        ticket.category,
        ticket.subject,
        ticket.status,
        ticket.first_response_minutes,
        ticket.resolution_hours,
        ticket.root_cause,
        ticket.customer_impact
    );
}

console.log("Support tickets imported successfully.");