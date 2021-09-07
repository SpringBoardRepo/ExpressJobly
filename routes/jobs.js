const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");


const router = new express.Router();

/* GET / => { "jobs":[{"id": 1,"title": 
                 "Conservator, furniture", 
                  "salary": 110000,
                   "equity": "0",
                    "company_handle": "watson-davis"}
]}*/
router.get("/", async (req, res) => {

    const jobs = await Job.getAll();
    return res.json({ jobs: jobs });
})

/* GET /jobs/:id 
   Get job by id 
   Retruns job { id ,title ......}
*/

router.get('/:id', async (req, res, next) => {

    try {
        const { id } = req.params
        const job = await Job.findAJob(id);

        return res.json({ job });
    }
    catch (err) {
        return next(err);
    }
})



/** POST /jobs   {job} : {job}
 *
 *  Create a new job  job should be {title , salary , equity, company_handle}
 *  
 *  Returns {id , title, salary, equity, company_handle}
 * 
 * Authorization required : login as admin 
 */
router.post('/', ensureAdmin, async (req, res, next) => {

    try {
        const validator = jsonschema.validate(req.body, jobSchema);
        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (error) {
        return next(error)
    }
})
/** Update the job data with job id
 * 
 *  it's partial update 
 * 
 *  Should not change job id and conmpany_handle
 * 
 * Authorization Required : admin login
 */
router.patch('/:id', ensureAdmin, async (req, res, next) => {

    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Job.update(req.params.id, req.body);
        return res.json({ job });

    } catch (error) {
        return next(err);
    }
})
/**DELETE a job by id
 * 
 * Authorization required : admin login
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {

    try {
        const { id } = req.params;
        const job = await Job.delete(id);

        return res.json({ deleted: "Job Deleted" });
    } catch (error) {
        return next(error);
    }
})



module.exports = router;