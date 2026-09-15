# Automotive Integration Health Monitor

A Node.js and SQL application that simulates how a Technical Account Manager can monitor customer integrations, investigate API failures, and identify at-risk automotive accounts.

## Overview

The Automotive Integration Health Monitor was built as a hands-on project to strengthen my experience with Node.js, JavaScript, SQL, REST APIs, and technical account management workflows.

## Technologies

- Node.js
- JavaScript
- Express.js
- SQLite
- SQL
- Postman

## Architecture

```text
Synthetic Automotive Dataset
            |
            v
          Excel
            |
            v
      import-data.js
            |
            v
          SQLite
            |
            v
    -------------------
    | Accounts        |
    | API Requests    |
    | Support Tickets |
    -------------------
            |
            v
        SQL Queries
            |
            v
         Node.js
            |
            v
     Health Scoring
            |
            v
        Express API
            |
            v
          Postman
```

## Key Features

### Account Health Monitoring

The application combines account information, API performance, and support activity to determine customer health.

Health indicators include:

- API success rate
- Failed API requests
- Average API latency
- Open support tickets
- Critical P1/P2 tickets

Accounts are classified as:

- Healthy
- Needs Attention
- At Risk

### API Failure Analysis

The application identifies integration errors including:

- ``` 400 VALIDATION_ERROR ```
- ```401 AUTH_FAILED```
- ```409 DUPLICATE_RECORD```
- ```429 RATE_LIMITED```
- ```500 INTERNAL_ERROR```
- ```503 SERVICE_UNAVAILABLE```

### Troubleshooting Data

Recent API failures include information such as:

- Timestamp
- Endpoint
- HTTP status code
- Error code
- Correlation ID

This provides the information a Technical Account Manager could use to investigate an issue or escalate it to an engineering team.

## Example Endpoint

```
GET /accounts/ACC004/health
```

Example local request:

```
http://localhost:3000/accounts/ACC004/health
```

Example response structure:

```
{
  accountId: 'ACC004',
  accountName: 'Blue Ridge Motors',
  integrationType: 'REST API',
  accountStatus: 'At Risk',
  apiHealth: {
    totalRequests: 158,
    successfulRequests: 145,
    failedRequests: 13,
    successRate: 91.77,
    averageLatency: 389
  },
  supportHealth: { openTickets: 9, criticalTickets: 3 },
  recentErrors: [
    {
      request_timestamp: '46268.916504629633',
      endpoint: '/v1/service-events',
      status_code: 429,
      error_code: 'RATE_LIMITED',
      correlation_id: 'corr-717953'
    },
    {
      request_timestamp: '46265.353263888886',
      endpoint: '/v1/service-events',
      status_code: 400,
      error_code: 'VALIDATION_ERROR',
      correlation_id: 'corr-313794'
    },
    {
      request_timestamp: '46262.485069444447',
      endpoint: '/v1/vehicles',
      status_code: 500,
      error_code: 'INTERNAL_ERROR',
      correlation_id: 'corr-146896'
    },
    {
      request_timestamp: '46262.461284722223',
      endpoint: '/v1/telemetry',
      status_code: 400,
      error_code: 'VALIDATION_ERROR',
      correlation_id: 'corr-687229'
    },
    {
      request_timestamp: '46261.26190972222',
      endpoint: '/v1/customers',
      status_code: 429,
      error_code: 'RATE_LIMITED',
      correlation_id: 'corr-792441'
    }
  ],
  errorSummary: [
    { error_code: 'RATE_LIMITED', count: 4 },
    { error_code: 'INTERNAL_ERROR', count: 4 },
    { error_code: 'VALIDATION_ERROR', count: 2 },
    { error_code: 'SERVICE_UNAVAILABLE', count: 1 },
    { error_code: 'NOT_FOUND', count: 1 },
    { error_code: 'AUTH_FAILED', count: 1 }
  ],
  calculatedHealth: 'At Risk'
}
```

## SQL Concepts Demonstrated

The project uses SQL for:

Filtering customer and API data
Aggregating API request metrics
Calculating API success rates
Identifying failed requests
Counting support incidents
Joining customer and integration data
Grouping failures by account and error type

SQL concepts include:

```
SELECT
WHERE
JOIN
LEFT JOIN
GROUP BY
ORDER BY
COUNT
SUM
AVG
CASE
```

## Running the Project

1. Clone the repository
```
git clone <repository-url>
```
2. Install dependencies
```
npm install
```
3. Import the synthetic dataset
```
node import-data.js
```
This creates and populates the local SQLite database.

4. Start the application
```
node app.js
```
The server will run locally on port 3000.

5. Test an account

Using a browser or Postman:
```
http://localhost:3000/accounts/ACC004/health
```

## Example TAM Workflow

A customer reports that vehicle data is not updating correctly.

A Technical Account Manager could use the application to:

1. Identify the customer's account.
2. Review its API success rate.
3. Identify recent failed requests.
4. Determine whether failures are authentication, validation, rate-limit, or server-related.
5. Retrieve correlation IDs for deeper investigation.
6. Review related support incidents.
7. Determine the overall health of the integration.
8. Escalate actionable technical information when engineering assistance is required.

## Dataset

The project uses a synthetic automotive dataset created specifically for technical practice.

The dataset contains fictional:

Automotive accounts
Customers
Vehicles
Service events
Telematics events
API requests
Support tickets

<ins>**No production customer information or proprietary company data is used.**</ins>

## Future Improvements

Potential future enhancements include:

- Account health dashboard
- Authentication
- Historical health trends
- Automated alerts
- API error-rate trend detection
- Additional vehicle and telematics analysis
- Unit and integration tests
- Docker support

## Purpose

This project demonstrates practical working knowledge of Node.js, JavaScript, SQL, APIs, and technical troubleshooting within a post-sale automotive SaaS environment.