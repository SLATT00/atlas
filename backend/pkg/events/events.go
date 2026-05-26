package events

const (
	TopicUserEvents        = "atlas.users"
	TopicAccountEvents     = "atlas.accounts"
	TopicTransactionEvents = "atlas.transactions"
	TopicTransferEvents    = "atlas.transfers"
	TopicCardEvents        = "atlas.cards"
	TopicWalletEvents      = "atlas.wallets"
	TopicLoanEvents        = "atlas.loans"
	TopicSavingsEvents     = "atlas.savings"
	TopicNotifications     = "atlas.notifications"
	TopicAudit             = "atlas.audit"
	TopicCompliance        = "atlas.compliance"
)

type Event struct {
	ID            string      `json:"id"`
	Type          string      `json:"type"`
	AggregateID   string      `json:"aggregate_id"`
	AggregateType string      `json:"aggregate_type"`
	Payload       interface{} `json:"payload"`
	Timestamp     int64       `json:"timestamp"`
	CorrelationID string      `json:"correlation_id"`
	ServiceName   string      `json:"service_name"`
}

// User Events
const (
	UserCreated    = "user.created"
	UserUpdated    = "user.updated"
	UserVerified   = "user.verified"
	UserSuspended  = "user.suspended"
	UserActivated  = "user.activated"
)

// Account Events
const (
	AccountCreated  = "account.created"
	AccountFrozen   = "account.frozen"
	AccountUnfrozen = "account.unfrozen"
	AccountClosed   = "account.closed"
)

// Transaction Events
const (
	TransactionCreated   = "transaction.created"
	TransactionCompleted = "transaction.completed"
	TransactionFailed    = "transaction.failed"
)

// Transfer Events
const (
	TransferCreated    = "transfer.created"
	TransferProcessing = "transfer.processing"
	TransferCompleted  = "transfer.completed"
	TransferFailed     = "transfer.failed"
	TransferCancelled  = "transfer.cancelled"
)

// Card Events
const (
	CardIssued    = "card.issued"
	CardActivated = "card.activated"
	CardFrozen    = "card.frozen"
	CardUnfrozen  = "card.unfrozen"
	CardBlocked   = "card.blocked"
)

// Wallet Events
const (
	WalletCreated       = "wallet.created"
	DepositReceived     = "wallet.deposit_received"
	WithdrawalCompleted = "wallet.withdrawal_completed"
)

// Loan Events
const (
	LoanCreated    = "loan.created"
	LoanApproved   = "loan.approved"
	LoanFunded     = "loan.funded"
	LoanRepaid     = "loan.repaid"
	LoanLiquidated = "loan.liquidated"
)

// Notification Events
const (
	NotificationCreated = "notification.created"
	NotificationSent    = "notification.sent"
)
