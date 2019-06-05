describe('Cluster functionality test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Add cluster', () => {
    const clusterName = 'test cluster';
    const url = 'example.com';
    const token = '123456';

    it('adds cluster with valid data', () => {
      cy.get('#add-cluster-btn').then(() => {
        cy.get('#add-cluster-btn')
          .first()
          .click()
          .then(() => {
            cy.get('#cluster-name-input').type(clusterName);
            cy.get('#url-input').type(url);
            cy.get('#token-input').type(token);
            cy.get('#check-connection-btn').click();
            cy.get('#submit-cluster-btn').click();
          });
      });
      cy.contains('test cluster');
    });

    it('has buttons disabled when input data is missing', () => {
      cy.get('#add-cluster-btn').then(() => {
        cy.get('#add-cluster-btn')
          .first()
          .click()
          .then(() => {
            cy.get('#cluster-name-input').should('have.value', '');
            cy.get('#url-input').type(url);
            cy.get('#token-input').type(token);
            cy.get('#check-connection-btn').should('be.disabled');
            cy.get('#submit-cluster-btn').should('be.disabled');
          });
      });
    });
  });
  // TODO: add tests for update and delete cluster, after
  // https://github.com/fusor/mig-ui/pull/211#issuecomment-498383188 will be fixed
});
