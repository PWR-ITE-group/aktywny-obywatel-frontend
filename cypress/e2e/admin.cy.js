describe('Admin Bypass Flow', () => {
  beforeEach(() => {
    cy.visit('/logowanie');
  });

  it('bypasses the backend using the mock admin credentials', () => {
    cy.get('input[type="email"]').type('admin@test.pl');
    cy.get('input[type="password"]').type('admin123');
    cy.contains('button', 'Zaloguj się').click();

    // Verify redirect to admin page
    cy.url().should('include', '/admin');
    cy.contains('Panel administratora').should('be.visible');

    // Verify mock data is loaded
    cy.contains('Zarządzaj zgłoszeniami').should('be.visible');
  });
});
