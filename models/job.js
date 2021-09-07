"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {

    // Get all jobs
    static async getAll() {

        const result = await db.query(`SELECT * FROM jobs`);
        return result.rows;
    }

    //Create a new Job
    static async create(body) {

        const newJob = await db.query(`INSERT INTO jobs(title, salary, equity, company_handle)
                                     VALUES($1, $2, $3, $4) RETURNING * `,
            [body.title, body.salary, body.equity, body.company_handle]);

        return newJob.rows[0];

    }

    /**Find A job By id  should return job {id,title.....}*/

    static async findAJob(id) {

        const findjob = await db.query(`SELECT * FROM jobs WHERE id =$1`, [id]);

        const job = findjob.rows[0];

        if (!job) {
            throw new NotFoundError(`Job ${id} not Found`);
        }

        return job;
    }


    /** Update a job with job id /jobs/:id
     *  update the db
     * 
     * Returns {job : id, title,......}
     */

    static async update(id, data) {

        const { setCols, values } = sqlForPartialUpdate(data, {});

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** DELETE a job FrOm db  */
    static async delete(id) {
        const job = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [id]);

        const j = job.rows[0];
        if (!j) {
            throw new BadRequestError("Job Not Found");
        }
    }

}

module.exports = Job;