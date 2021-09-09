const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");


const router = new express.Router();

/* GET / => { "jobs":[{"id","title",  "salary","equity",
                    "company_handle"}]}
      
     Can Filter by title (will find case-insensitive, partial matches)
     *  minSalary, hasEquity
     *
     * Authorization required : none
*/
router.get("/", async (req, res, next) => {

    const q = req.query;
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";
    try {
        const jobs = await Job.getAll(q);
        return res.json({ jobs });
    } catch (error) {
        return next(error);
    }

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

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job: job });

    } catch (error) {
        return next(error);
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