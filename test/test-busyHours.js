const chai = require('chai');
const chaiHttp = require('chai-http');

const { app } = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('busyHours API', function () {
    it('should 200 on GET requests', function () {
        return chai
            .request(app)
            .get('/busyHours/ChIJO0EmQfpbwokRGLOt2v1MNBY')
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });
});