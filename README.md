# Payment Service (be_payment)

Backend payment service for handling transaction payments in the EnergiQ platform.

## Overview

The payment service manages payment transactions for charging sessions between users and providers. It implements a repository pattern with a centralized payment client for transaction amount retrieval.

## Architecture

### Payment Flow States

- **PENDING** → `putTransactionPayment()` - Create payment record
- **IN_PROGRESS** → `payTransaction()` - Generate payment URL
- **DONE/FAILED** → Webhook updates - Final status from payment provider

### Repository Pattern

The service implements a repository pattern with the following core functions:

```typescript
// Get transaction payment details
getTransactionPaymentDetails(transactionId: string): TransactionPaymentDetails

// Get provider payment transactions
getProviderPaymentTransactions(providerId: string): TransactionPaymentDetails[]

// Get user payment transactions  
getUserPaymentTransactions(userId: string): TransactionPaymentDetails[]

// Create transaction payment (PENDING)
putTransactionPayment(TransactionPaymentDetails): PaymentError | null

// Process payment (IN_PROGRESS) 
payTransaction(transactionId: string): string // returns payment URL
```

### Data Model

```typescript
interface TransactionPaymentDetails {
    transaction_id: string;     // UUID
    provider_id: string;        // UUID
    user_id: string;           // UUID
    cp_id: string;             // Charging Point ID
    payment_status: PaymentStatus;
    amount?: number;           // in EGP
    created_at?: Date;
}
```

## API Endpoints

### Transaction Management

- `GET /api/v1/payments/transactions/:transactionId` - Get payment details
- `POST /api/v1/payments/transactions` - Create transaction payment
- `POST /api/v1/payments/transactions/:transactionId/pay` - Process payment

### User & Provider Queries

- `GET /api/v1/payments/users/:userId/transactions` - Get user transactions
- `GET /api/v1/payments/providers/:providerId/transactions` - Get provider transactions

### Webhooks

- `POST /api/v1/payments/webhook` - Payment status updates

### Health Check

- `GET /health` - Service health status

## Payment Client

Mock client for getting transaction amounts:

```typescript
class PaymentClient {
    async getTransactionAmount(transactionId: string): Promise<number>
}
```

Currently returns mock amounts (50-500 EGP). Ready for integration with actual payment providers.

## Development

### Setup

```bash
cd be_payment
npm install
npm run dev
```

### Environment Variables

```env
NODE_ENV=development
LISTEN_PORT=8003
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=energiq_payment
HTTP_LOGGING=true
HTTP_BODY_LOGGING=false
PAYMENT_WEBHOOK_SECRET=webhook_secret
```

### Database

The service uses PostgreSQL with TypeORM. Run migrations:

```bash
npm run migration:run
```

## Future Integration

- Paymob integration for actual payment processing
- Enhanced webhook validation
- Payment retry mechanisms
- Transaction reconciliation
- Multi-currency support

## Architecture Compliance

The service follows the same structure as other EnergiQ microservices:
- Repository pattern for data access
- TypeORM for database management
- Express.js with TypeScript
- Consistent error handling and logging
- Health check endpoints 