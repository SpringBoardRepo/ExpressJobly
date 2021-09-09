"use strict";

const request = require("supertest");
process.env.NODE_ENV = "test";
const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u4Token, testJobIds
} = require("./_testCommon");
const { UnauthorizedError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** Post /jobs */

describe('POST routes', function () {

    const newJob = {
        title: "Test Job",
        salary: 200,
        company_handle: 'c1',
        equity: "0"
    }
    test('Post a new job', async () => {

        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("token", u4Token);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job:
            {
                id: expect.any(Number),
                title: "Test Job",
                salary: 200,
                company_handle: 'c1',
                equity: "0"
            }
        });
    })

    test('Unauthorized if not admin', async () => {

        const resp = await request(app)
            .post('/jobs')
            .send(newJob);

        expect(resp.statusCode).toEqual(401);
    })

    test('Bad request fo invalid data', async () => {

        const resp = await request(app)
            .post('/jobs')
            .send({
                ...newJob,
                equity: "abc"
            }).set("token", u4Token);;
        expect(resp.statusCode).toEqual(500);
    })
})


/** Get Routes */

describe(' GET routes', function () {


    test('Get /jobs should works', async () => {

        let res = await request(app).get('/jobs');
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "job1",
                salary: 10000,
                company_handle: "c1",
                equity: "0",
                name: "C1"
            },
            {
                id: expect.any(Number),
                title: "job2",
                salary: 50000,
                company_handle: "c2",
                equity: "0",
                name: "C2"
            },
            {
                id: expect.any(Number),
                title: "job3",
                salary: 30000,
                company_handle: "c1",
                equity: "0.2",
                name: "C1"
            }
            ]
        })

    })

})

/************ Get job by Id */

describe('Get job by id', function () {

    test('Get /job/:id ', async () => {

        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'job1',
                salary: 10000,
                equity: '0',
                company_handle: 'c1'
            }
        })
    })

    test('Get /job/:id for invalid jobid ', async () => {

        const resp = await request(app).get(`/jobs/0`);

        expect(resp.statusCode).toEqual(404);
    })
})

/**** ***** Patch routes *********** */

describe('Update a job', function () {

    test('should partial update a job for admin', async function () {

        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "newJob",
            })
            .set("token", u4Token);

        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: 'newJob',
                salary: 10000,
                equity: '0',
                company_handle: 'c1'
            }
        })
    })

    test('if not a admin', async function () {

        const resp = await request(app).patch(`/jobs/${testJobIds[0]}`)
            .send({ title: "newJob" });
        expect(resp.statusCode).toEqual(401);
    })

    test('if job id  is not found', async function () {

        const resp = await request(app).patch(`/jobs/0}`)
            .send({ title: "newJob" }).set("token", u4Token);
        expect(resp.statusCode).toEqual(500);

    })
})

/******************** Delete a job */

describe('DELETE a job by id', function () {

    test('if not a admin', async () => {
        const resp = await request(app).delete(`/jobs/${testJobIds[0]}`)
            .set("token", u4Token);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ deleted: "Job Deleted" })
    })


    test('if not a admin', async () => {
        const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);

    })

    test('Delete a Job by invalid id ', async () => {

        const resp = await request(app).delete(`/delete/0`);
        expect(resp.statusCode).toEqual(404);

    })
})