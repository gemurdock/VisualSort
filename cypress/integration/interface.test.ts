/// <reference types="cypress" />

context('Interface', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/VisualSort');
    });

    it('start should change init values of Comparisons, Swaps, and Time', () => {
        cy.contains('Start').click()
            .wait(1500);
        cy.contains('Stop').click();
        cy.contains('Comparisons:').should('not.have.text', 'Comparisons: 0');
        cy.contains('Swaps:').should('not.have.text', 'Swaps: 0');
        cy.contains('Time:').should('not.have.text', 'Time: 0s');
    });
});
