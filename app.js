const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("automotive.db");

//THIS CALCULATES WHETHER AN ACCOUNT IS AT-RISK OR NEEDS ATTENTION THROUGH SUCCESS RATE, FAILED REQUESTS, AND CRITICAL TICKETS
function calculateHealth(successRate, failedRequests, criticalTickets) {

    if (
        successRate < 95 ||
        failedRequests > 10 ||
        criticalTickets >= 3
    ) {
        return "At Risk";
    }

    if (
        successRate < 98 ||
        failedRequests > 5 ||
        criticalTickets >= 1
    ) {
        return "Needs Attention";
    }

    return "Healthy";
}

//THIS FUNCTION PULLS ACCOUNT DATA FROM DATABASE TO CALCULATE HEALTH
function getAccountHealth(accountId) {

    //GRABS ACCOUNT DATA FROM DB
    const account = db.prepare(`
        SELECT
            account_id,
            account_name,
            integration_type,
            status
        FROM Accounts
        WHERE account_id = ?
    `).get(accountId);

    //WILL RETURN NULL IS ACCOUNT DOES NOT EXIST
    if (!account) {
        return null;
    }

    //GIVES THE NUMBER OF SUCCESSFUL REQUESTS, FAILED REQUESTS, AND AVERAGE LATENCY
    const apiStats = db.prepare(`
        SELECT
            COUNT(*) AS total_requests,

            SUM(
                CASE
                    WHEN status_code < 400 THEN 1
                    ELSE 0
                END
            ) AS successful_requests,

            SUM(
                CASE
                    WHEN status_code >= 400 THEN 1
                    ELSE 0
                END
            ) AS failed_requests,

            ROUND(
                AVG(latency_ms),
                0
            ) AS average_latency

        FROM API_Requests

        WHERE account_id = ?
        AND environment = 'Production'
    `).get(accountId);

    //GIVES A PERCENT OF ALL SUCCESSFULL REQUESTS
    const successRate =
        apiStats.total_requests > 0
            ? Number(
                (
                    apiStats.successful_requests /
                    apiStats.total_requests *
                    100
                ).toFixed(2)
            )
            : 0;

    //COUNTS ALL OPEN TICKETS
    const ticketStats = db.prepare(`
        SELECT
            COUNT(*) AS open_tickets,

            SUM(
                CASE
                    WHEN priority IN ('P1', 'P2')
                    THEN 1
                    ELSE 0
                END
            ) AS critical_tickets

        FROM Support_Tickets

        WHERE account_id = ?
        AND status != 'Closed'
    `).get(accountId);

    //HEALTH CALCULATION FUNCTION CALL
    const health = calculateHealth(
    successRate,
    apiStats.failed_requests,
    ticketStats.critical_tickets
    );
    
    //SHOWS ALL OF THE MOST RECENT ERRORS
    const recentErrors = db.prepare(`
        SELECT
            request_timestamp,
            endpoint,
            status_code,
            error_code,
            correlation_id

        FROM API_Requests

        WHERE account_id = ?
        AND environment = 'Production'
        AND status_code >= 400

        ORDER BY request_timestamp DESC

        LIMIT 5
    `).all(accountId);

    //GIVES SUMMARY OF ALL ERROR
    const errorSummary = db.prepare(`
        SELECT
            error_code,
            COUNT(*) AS count

        FROM API_Requests

        WHERE account_id = ?
        AND environment = 'Production'
        AND status_code >= 400

        GROUP BY error_code

        ORDER BY count DESC
    `).all(accountId);
    
    return {
    accountId: account.account_id,
    accountName: account.account_name,
    integrationType: account.integration_type,
    accountStatus: account.status,

    apiHealth: {
        totalRequests: apiStats.total_requests,
        successfulRequests: apiStats.successful_requests,
        failedRequests: apiStats.failed_requests,
        successRate: successRate,
        averageLatency: apiStats.average_latency
    },

    supportHealth: {
        openTickets: ticketStats.open_tickets,
        criticalTickets: ticketStats.critical_tickets
    },

    recentErrors: recentErrors,

    errorSummary: errorSummary,

    calculatedHealth: health
    };
}

//SENDS A GET REQUEST TO ACCESS HOMEPAGE OF SERVER
app.get("/", (req, res) => {

    res.json({
        message: "Automotive Integration Health Monitor"
    });

});

//SENDS A GET REQUEST TO QUERY ACCOUNT DATA FROM DB
app.get("/accounts/:accountId/health", (req, res) => {

    const accountId = req.params.accountId;

    const health = getAccountHealth(accountId);

    if (!health) {
        return res.status(404).json({
            error: "Account not found"
        });
    }

    res.json(health);

});

//USES EXPRESS TO HOST SERVER CONNECTED TO THIS APP
app.listen(3000, () => {
    console.log(
        "Server running at http://localhost:3000"
    );
});