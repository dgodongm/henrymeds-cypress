describe('appointment test spec', () => {
  it('Partial appointment flow', () => {
    // Test going up to payment screen

    // Go to appointment landing page
    cy.visit('?override_kameleoon')
    // check appointment landing page
    cy.get('h2').contains('Schedule your Appointment!')
    cy.get('p').contains('What state do you live in?')
    cy.get('div.MuiStack-root').within(() => {
      cy.get('button')
        .should('have.length', 14)
        .then((list) => Cypress._.map(list, 'innerText'))
        .should((list) => {
          const just_states = list.slice(0, list.length - 1)
          const sorted_states = just_states.toSorted()
          expect(just_states).to.be.deep.equal(sorted_states)
        })
    })

    // select state
    cy.getByData('washington').click()

    // check that there are available appointment slots and select first one
    cy.get('h2').contains('Next Available Time')
    cy.get('p').contains('Select a time to meet with a licensed provider about')
    cy.get('div.MuiStack-root')
      .first()
      .within(() => {
        cy.get('button').should('have.length.gt', 0).first().click()
      })

    // check "pending appointment/next steps" page
    cy.get('p').contains('You have a pending appointment for') // TODO: also check time, date, provider, and maybe even profile image
    cy.get('h1').contains('Next Steps')

    // click Continue
    cy.getByData('appointmentOverviewContinue').click()

    // check contact details page
    cy.get('h3').contains('Contact Details')

    // fill out contact details and click Continue
    cy.getByData('firstName').type('Demian')
    cy.getByData('lastName').type('Godon')
    cy.getByData('email').type('dman@goforth.com')
    cy.getByData('verifyEmail').type('dman@goforth.com')
    cy.getByData('dob').type('01/20/1975')
    cy.getByData('phoneNumber').type('206-675-9999')
    cy.getByData('sex').select('Male')
    cy.getByData('tosConsent').check()
    cy.getByData('contactDetailsContinue').click()

    // check shipping page
    cy.get('h3').contains('Shipping')
    cy.getByData('state').should('be.visible').and('be.disabled') // TODO: check that previously selected state is displayed in disabled drop-down

    // fill out shipping info and click Continue
    cy.getByData('addressLine1').type('701 N 34th Street')
    cy.getByData('city').type('Seattle')
    cy.getByData('zip').type('98103')
    cy.getByData('shippingAddressContinue').click()

    // check payment screen
    cy.get('h3').contains('Payment Method')
    cy.get('form').within(() => {
      cy.get('[id*="card"]').contains('Card Number')
    })
    cy.getByData('startTreatment').should('be.enabled')
  })
})
