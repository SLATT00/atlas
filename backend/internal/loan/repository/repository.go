package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Loan struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	LoanType       string    `json:"loan_type"`
	LoanAmount     string    `json:"loan_amount"`
	LoanCurrency   string    `json:"loan_currency"`
	InterestRate   string    `json:"interest_rate"`
	Status         string    `json:"status"`
	LTV            string    `json:"ltv"`
	TermMonths     *int      `json:"term_months,omitempty"`
	MonthlyPayment *string   `json:"monthly_payment,omitempty"`
	TotalRepaid    string    `json:"total_repaid"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Version        int       `json:"version"`
}

type Collateral struct {
	ID               string    `json:"id"`
	LoanID           string    `json:"loan_id"`
	Asset            string    `json:"asset"`
	Amount           string    `json:"amount"`
	MarketValue      string    `json:"market_value"`
	LiquidationPrice *string   `json:"liquidation_price,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Repayment struct {
	ID        string    `json:"id"`
	LoanID    string    `json:"loan_id"`
	Amount    string    `json:"amount"`
	Type      string    `json:"type"`
	CreatedAt time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateLoan(ctx context.Context, loan *Loan) error {
	loan.ID = uuid.New().String()
	loan.Status = "pending"
	loan.TotalRepaid = "0.00"
	loan.CreatedAt = time.Now()
	loan.UpdatedAt = time.Now()
	loan.Version = 1

	_, err := r.pool.Exec(ctx, `
		INSERT INTO loans (id, user_id, loan_type, loan_amount, loan_currency, interest_rate,
			status, ltv, term_months, monthly_payment, total_repaid, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`, loan.ID, loan.UserID, loan.LoanType, loan.LoanAmount, loan.LoanCurrency,
		loan.InterestRate, loan.Status, loan.LTV, loan.TermMonths, loan.MonthlyPayment,
		loan.TotalRepaid, loan.CreatedAt, loan.UpdatedAt, loan.Version)
	return err
}

func (r *Repository) GetLoanByID(ctx context.Context, id string) (*Loan, error) {
	loan := &Loan{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, loan_type, loan_amount, loan_currency, interest_rate,
			status, ltv, term_months, monthly_payment, total_repaid, created_at, updated_at, version
		FROM loans WHERE id = $1
	`, id).Scan(
		&loan.ID, &loan.UserID, &loan.LoanType, &loan.LoanAmount, &loan.LoanCurrency,
		&loan.InterestRate, &loan.Status, &loan.LTV, &loan.TermMonths, &loan.MonthlyPayment,
		&loan.TotalRepaid, &loan.CreatedAt, &loan.UpdatedAt, &loan.Version,
	)
	if err != nil {
		return nil, err
	}
	return loan, nil
}

func (r *Repository) GetLoansByUserID(ctx context.Context, userID string) ([]Loan, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, loan_type, loan_amount, loan_currency, interest_rate,
			status, ltv, term_months, monthly_payment, total_repaid, created_at, updated_at, version
		FROM loans WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var loans []Loan
	for rows.Next() {
		var l Loan
		if err := rows.Scan(&l.ID, &l.UserID, &l.LoanType, &l.LoanAmount, &l.LoanCurrency,
			&l.InterestRate, &l.Status, &l.LTV, &l.TermMonths, &l.MonthlyPayment,
			&l.TotalRepaid, &l.CreatedAt, &l.UpdatedAt, &l.Version); err != nil {
			return nil, err
		}
		loans = append(loans, l)
	}
	return loans, nil
}

func (r *Repository) UpdateLoanStatus(ctx context.Context, id, status string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE loans SET status = $2, updated_at = NOW(), version = version + 1
		WHERE id = $1
	`, id, status)
	return err
}

func (r *Repository) CreateCollateral(ctx context.Context, c *Collateral) error {
	c.ID = uuid.New().String()
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO loan_collateral (id, loan_id, asset, amount, market_value, liquidation_price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, c.ID, c.LoanID, c.Asset, c.Amount, c.MarketValue, c.LiquidationPrice, c.CreatedAt, c.UpdatedAt)
	return err
}

func (r *Repository) GetCollateralByLoanID(ctx context.Context, loanID string) ([]Collateral, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, loan_id, asset, amount, market_value, liquidation_price, created_at, updated_at
		FROM loan_collateral WHERE loan_id = $1
	`, loanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var collateral []Collateral
	for rows.Next() {
		var c Collateral
		if err := rows.Scan(&c.ID, &c.LoanID, &c.Asset, &c.Amount, &c.MarketValue,
			&c.LiquidationPrice, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		collateral = append(collateral, c)
	}
	return collateral, nil
}

func (r *Repository) CreateRepayment(ctx context.Context, rep *Repayment) error {
	rep.ID = uuid.New().String()
	rep.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO loan_repayments (id, loan_id, amount, type, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, rep.ID, rep.LoanID, rep.Amount, rep.Type, rep.CreatedAt)
	return err
}
