const { Router } = require('express')
const router = Router()


router.use('/users', require('./users'))
router.use("/courses", require("./courses"));
router.use("/submissions", require("./submissions"));
router.use("/assignments", require("./assignments"));

module.exports = router
