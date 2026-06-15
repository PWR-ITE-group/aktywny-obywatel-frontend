describe('Authentication Flows', () => {
  beforeEach(() => {
    cy.visit('/logowanie');
  });

  it('allows a user to navigate to the registration page', () => {
    cy.contains('Zarejestruj się').click();
    cy.url().should('include', '/rejestracja');
    cy.contains('Utwórz konto').should('be.visible');
  });

  it('shows error for invalid login credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.pl');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.contains('button', 'Zaloguj się').click();

    // The mock won't accept invalid credentials, or the backend will reject it
    cy.get('.MuiAlert-message').should('be.visible');
  });
});
