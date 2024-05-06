export const verifyAppointmentLandingPage = () => {
  // check header text and display of U.S. state buttons
  // TODO: consider if there's better oracle for list of states
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
}

export const verifyAvailableSlotsPage = () => {
  // check header text and that there's at least 1 available appointment slot shown
  // TODO: could add more precise check on number of available slots (such as comparing against API response)
  cy.get('h2').contains('Next Available Time')
  cy.get('p').contains('Select a time to meet with a licensed provider about')
  cy.get('div.MuiStack-root')
    .first()
    .within(() => {
      cy.get('button').should('have.length.gt', 0)
    })
}

export const verifyNextStepsPage = (selectedSlotTime) => {
  // check header text, ensuring it contains selected appointment slot time
  // TODO: could also check date, provider, and maybe even profile image
  const appointmentHeaderRE = new RegExp(
    'You have a pending appointment for.+' + selectedSlotTime + '.+'
  )
  cy.get('p').contains(appointmentHeaderRE)
  cy.get('h1').contains('Next Steps')
}

export const verifyShippingPage = () => {
  cy.get('h3').contains('Shipping')
  cy.getByData('state').should('be.visible').and('be.disabled') // TODO: check that previously selected state is displayed in disabled drop-down
}

export const verifyPaymentPage = (firstName, lastName) => {
  cy.get('h3').contains('Payment Method')
  cy.get('form').within(() => {
    cy.get('[id*="card"]').contains('Card Number')
    cy.getByData('firstName').should('have.value', firstName)
    cy.getByData('lastName').should('have.value', lastName)
  })
  cy.getByData('startTreatment').should('be.enabled')
}

export const get_available_appointments = (
  startDate,
  endDate,
  state,
  treatmentShortId
) => {
  return cy.request({
    method: 'POST',
    url: 'https://henry-dev.hasura.app/v1/graphql',
    body: {
      operationName: 'cappedAvailableTimes',
      query: `
          query 
          cappedAvailableTimes($state: String!, $treatmentShortId: String!, $minimumDate: timestamptz!, $maximumDate: timestamptz!) 
          {\n  cappedAvailableTimes: appointment_capped_available_appointment_slots(\n    where: {start_time: {_gt: $minimumDate, _lt: $maximumDate}, state: {_eq: $state}, treatment_object: {short_id: {_eq: $treatmentShortId}}, language: {_eq: \"en-US\"}, provider: {_and: {id: {_is_null: false}}}}\n    order_by: {start_time: asc}\n  ) {\n    ...CappedAvailableSlotsFragment\n    __typename\n  }\n}\n\nfragment CappedAvailableSlotsFragment on appointment_capped_available_appointment_slots {\n  startTime: start_time\n  endTime: end_time\n  provider {\n    id\n    displayName: display_name\n    profileImage: profile_image\n    __typename\n  }\n  __typename\n}
          `,
      variables: {
        minimumDate: startDate.toISOString(),
        maximumDate: endDate.toISOString(),
        state: state,
        treatmentShortId: treatmentShortId,
      },
    },
  })
}
