import { faker } from '@faker-js/faker'
import { valid_states } from '../../fixtures/valid_states'
import { getAvailableAppointments } from '../../support/utils'

// TODO: would be good to be able to seed the data for available slots for each state to better know what to expect
describe('cappedAvailableTimes GraphQL API test spec', () => {
  it('fetch available times for next couple weeks in California', () => {
    const minimumDate = new Date()
    const maximumDate = new Date()
    maximumDate.setDate(maximumDate.getDate() + 14)
    getAvailableAppointments(
      minimumDate,
      maximumDate,
      'california',
      'weightloss'
    ).then((response) => {
      expect(response.status).to.be.equal(200)
      expect(response.body.data.cappedAvailableTimes).to.have.lengthOf.above(0)
      expect(response.body.data.cappedAvailableTimes[0]).to.have.keys(
        'endTime',
        'provider',
        'startTime',
        '__typename'
      )
    })
  })

  // Generate 10 tests that vary the minimumDate and maximumDate input variables
  let startDate, endDate
  for (let i = 0; i < 10; i++) {
    startDate = faker.date.soon({ days: 2 })
    endDate = new Date()
    endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 30 }))

    it(`Calling with minimumDate: ${startDate.toISOString()}, maximumDate: ${endDate.toISOString()}`, () => {
      cy.log('startDate: ' + startDate.toISOString())
      cy.log('endDate: ' + endDate.toISOString())
      getAvailableAppointments(
        startDate,
        endDate,
        'california',
        'weightloss'
      ).then((response) => {
        expect(response.status).to.be.equal(200)
        expect(response.body.data.cappedAvailableTimes).to.have.lengthOf.above(
          0
        )
        expect(response.body.data.cappedAvailableTimes[0]).to.have.keys(
          'endTime',
          'provider',
          'startTime',
          '__typename'
        )
      })
    })
  }
})
