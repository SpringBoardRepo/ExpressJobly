"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll, testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**Create a Job */
describe('Create Job', function () {
    const newJob = {
        title: "newJob",
        salary: 10000,
        equity: "0",
        company_handle: 'c1'
    };

    test('Create newJob', async () => {

        let job = await Job.create(newJob);
        expect(job).toEqual({
            ...newJob,
            id: expect.any(Number)
        });
    })
})
/***************************** getAll ********************* */

describe('getAll', function () {

    test('works with no filter', async () => {

        let searchJob = await Job.getAll();
        expect(searchJob).toEqual([{
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
        },
        {
            id: expect.any(Number),
            title: "job4",
            salary: 40000,
            company_handle: "c2",
            equity: "0.1",
            name: "C2"
        }
        ])
    })

    test("works with filter title", async () => {

        let job = await Job.getAll({ title: "job1" });
        expect(job).toEqual([{
            id: expect.any(Number),
            title: "job1",
            salary: 10000,
            company_handle: "c1",
            equity: "0",
            name: "C1"
        }])
    })

    test("works with filter", async () => {

        let job = await Job.getAll({ hasEquity: true });
        expect(job).toEqual([{
            id: expect.any(Number),
            title: "job3",
            salary: 30000,
            company_handle: "c1",
            equity: "0.2",
            name: "C1"
        },
        {
            id: expect.any(Number),
            title: "job4",
            salary: 40000,
            company_handle: "c2",
            equity: "0.1",
            name: "C2"
        }
        ])
    })
})

/********************* Find A Job  **************/

describe('Find a job by id', function () {

    test('works to find a job by id', async () => {

        let job = await Job.findAJob(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "job1",
            salary: 10000,
            company_handle: "c1",
            equity: "0",
        });
    })

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError);
        }
    });
})

/************* Update  *************/

describe('Update a Job ', function () {

    let updateData = {
        title: "newJob",
        salary: 25000,
        equity: "0.5",

    }
    test('partial Update a job by id', async () => {

        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData,
        })
    })

    test('for not found', async () => {
        try {
            await Job.update(0, { title: "Job" });
        } catch (error) {
            expect(error instanceof NotFoundError);
        }
    })
})


describe('works for delete a job', function () {

    test('Delete a job', async () => {
        let job = await Job.delete(testJobIds[0]);
        const j = await db.query(` SELECT id FROM jobs WHERE id =$1`, [testJobIds[0]]);

        expect(j.rows.length).toEqual(0);
    })
    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError);
        }
    });
})