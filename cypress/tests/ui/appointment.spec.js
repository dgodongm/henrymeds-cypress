import { valid_users } from '../../fixtures/valid_users'
import { valid_states } from '../../fixtures/valid_states'
import {
  enterContactDetails,
  enterShippingDetails,
  verifyAppointmentLandingPage,
  verifyAvailableSlotsPage,
  verifyNextStepsPage,
  verifyPaymentPage,
  verifyShippingPage,
} from '../../support/utils'

describe('appointment test spec', () => {
  beforeEach(() => {
    // Go to appointment landing page
    cy.visit('?override_kameleoon')
  })

  it('Partial appointment flow', () => {
    // Test appointment booking flow for Washington going up to payment screen

    // check appointment landing page
    verifyAppointmentLandingPage()

    // select washington state
    cy.getByData(valid_states[valid_states.length - 1].testid).click()

    // check that there are available appointment slots and select first one
    verifyAvailableSlotsPage()
    cy.get('div.MuiStack-root')
      .first()
      .within(() => {
        cy.get('button')
          .first()
          .invoke('text')
          .then((slotTime) => {
            cy.log('First slot time: ' + slotTime)
            const firstSlotTime = slotTime
            cy.wrap(firstSlotTime).as('firstSlotTime')
          })
        cy.get('button').first().click()
      })

    // check "pending appointment/next steps" page
    cy.get('p').contains('You have a pending appointment for')
    cy.get('@firstSlotTime').then((selectedSlotTime) => {
      verifyNextStepsPage(selectedSlotTime)
    })

    // click Continue
    cy.getByData('appointmentOverviewContinue').click()

    // check contact details page
    cy.get('h3').contains('Contact Details')

    // fill out contact details and click Continue
    enterContactDetails(valid_users[0])
    cy.getByData('contactDetailsContinue').click()

    // check shipping page
    verifyShippingPage()

    // fill out shipping info and click Continue
    enterShippingDetails(valid_users[0])
    cy.getByData('shippingAddressContinue').click()

    // check payment screen
    verifyPaymentPage(valid_users[0].firstName, valid_users[0].lastName)
  })
})
