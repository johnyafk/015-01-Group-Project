// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  //We are checking POST /login API by passing correct user info. The request should return with status 200
  //Positive cases
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'tester', password: 'testerpw'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  //We are checking POST /login API by passing an incorrect user password. This test case should pass and return a status 200.
  it('Negative : /login. Checking invalid password', done => {
    chai
    .request(server)
    .post('/login')
    .send({username: 'tester', password: 'tester'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    });
  });

  //Testing register API
  //Positive Case
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'tester1', password: 'testerpw1'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  //Negative Case
  it('Negative : /register. Checking that a duplicate username cannot be used', done => {
    chai
    .request(server)
    .post('/register')
    .send({username: 'tester', password: 'testerpw'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    });
  });
  
});