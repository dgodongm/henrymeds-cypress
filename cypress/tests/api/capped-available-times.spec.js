describe('cappedAvailableTimes test spec', () => {
  it('fetch times for next couple weeks in California', () => {
    const minimumDate = new Date()
    const maximumDate = new Date()
    maximumDate.setDate(maximumDate.getDate() + 14)
    cy.request({
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
          minimumDate: minimumDate.toISOString(),
          maximumDate: maximumDate.toISOString(),
          state: 'california',
          treatmentShortId: 'weightloss',
        },
      },
    }).then((response) => {
      expect(response.status).to.be.equal(200)
      expect(response.body.data.cappedAvailableTimes).to.have.lengthOf.above(0)
    })
  })
})
